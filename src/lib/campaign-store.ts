import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Campaign, CreateCampaign } from "@/lib/campaign-schemas";

const SAFE_ID = /^[A-Za-z0-9_-]{6,64}$/;

type Backend = {
  read(id: string): Promise<Campaign | null>;
  write(id: string, campaign: Campaign): Promise<void>;
  list(): Promise<Campaign[]>;
};

const fileBackend: Backend = {
  async read(id) {
    try {
      const raw = await readFile(fileFor(id), "utf8");
      return JSON.parse(raw) as Campaign;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw err;
    }
  },
  async write(id, campaign) {
    const file = fileFor(id);
    await mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tmp, JSON.stringify(campaign, null, 2), "utf8");
    await rename(tmp, file);
  },
  async list() {
    try {
      const fs = await import("node:fs");
      const dir = campaignDir();
      const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
      const campaigns: Campaign[] = [];
      for (const file of files) {
        const raw = await readFile(path.join(dir, file), "utf8");
        campaigns.push(JSON.parse(raw) as Campaign);
      }
      return campaigns;
    } catch {
      return [];
    }
  },
};

function redisBackend(url: string, token: string): Backend {
  const call = async (...command: string[]) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(command),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Redis responded ${res.status}`);
    const data = (await res.json()) as { result?: unknown; error?: string };
    if (data.error) throw new Error(data.error);
    return data.result;
  };
  const key = (id: string) => `yesbird:campaign:${id}`;
  const indexKey = "yesbird:campaigns";
  return {
    async read(id) {
      const raw = await call("GET", key(id));
      return typeof raw === "string" ? (JSON.parse(raw) as Campaign) : null;
    },
    async write(id, campaign) {
      await call("SET", key(id), JSON.stringify(campaign));
      await call("SADD", indexKey, id);
    },
    async list() {
      const ids = (await call("SMEMBERS", indexKey)) as string[];
      const campaigns: Campaign[] = [];
      for (const id of ids) {
        const raw = await call("GET", key(id));
        if (typeof raw === "string") {
          campaigns.push(JSON.parse(raw) as Campaign);
        }
      }
      return campaigns;
    },
  };
}

function pickBackend(): Backend {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? redisBackend(url, token) : fileBackend;
}

const backend = pickBackend();

function campaignDir() {
  return path.join(process.cwd(), "data", "campaigns");
}

function fileFor(id: string) {
  return path.join(campaignDir(), `${id}.json`);
}

export async function createCampaign(input: CreateCampaign): Promise<Campaign> {
  const id = randomBytes(9).toString("base64url");
  const campaign: Campaign = {
    ...input,
    id,
    stats: {
      totalSent: 0,
      opens: 0,
      clicks: 0,
      bounces: 0,
      unsubscribes: 0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await backend.write(id, campaign);
  return campaign;
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  if (!SAFE_ID.test(id)) return null;
  return backend.read(id);
}

export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
  const existing = await getCampaign(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates, updatedAt: new Date() };
  await backend.write(id, updated);
  return updated;
}

export async function listCampaigns(): Promise<Campaign[]> {
  return backend.list();
}
