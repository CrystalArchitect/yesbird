import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Pitch, CreatePitch, Outlet, CreateOutlet } from "@/lib/pitch-schemas";

const SAFE_ID = /^[A-Za-z0-9_-]{6,64}$/;

type Backend = {
  readPitch(id: string): Promise<Pitch | null>;
  writePitch(id: string, pitch: Pitch): Promise<void>;
  listPitches(): Promise<Pitch[]>;

  readOutlet(id: string): Promise<Outlet | null>;
  writeOutlet(id: string, outlet: Outlet): Promise<void>;
  listOutlets(): Promise<Outlet[]>;
};

const fileBackend: Backend = {
  async readPitch(id) {
    try {
      const raw = await readFile(pitchFileFor(id), "utf8");
      return JSON.parse(raw) as Pitch;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw err;
    }
  },
  async writePitch(id, pitch) {
    const file = pitchFileFor(id);
    await mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tmp, JSON.stringify(pitch, null, 2), "utf8");
    await rename(tmp, file);
  },
  async listPitches() {
    try {
      const fs = await import("node:fs");
      const dir = pitchDir();
      const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && !f.startsWith("outlet-"));
      const pitches: Pitch[] = [];
      for (const file of files) {
        const raw = await readFile(path.join(dir, file), "utf8");
        pitches.push(JSON.parse(raw) as Pitch);
      }
      return pitches;
    } catch {
      return [];
    }
  },

  async readOutlet(id) {
    try {
      const raw = await readFile(outletFileFor(id), "utf8");
      return JSON.parse(raw) as Outlet;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw err;
    }
  },
  async writeOutlet(id, outlet) {
    const file = outletFileFor(id);
    await mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tmp, JSON.stringify(outlet, null, 2), "utf8");
    await rename(tmp, file);
  },
  async listOutlets() {
    try {
      const fs = await import("node:fs");
      const dir = pitchDir();
      const files = fs.readdirSync(dir).filter((f) => f.startsWith("outlet-") && f.endsWith(".json"));
      const outlets: Outlet[] = [];
      for (const file of files) {
        const raw = await readFile(path.join(dir, file), "utf8");
        outlets.push(JSON.parse(raw) as Outlet);
      }
      return outlets;
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

  const pitchKey = (id: string) => `yesbird:pitch:${id}`;
  const outletKey = (id: string) => `yesbird:outlet:${id}`;
  const pitchIndexKey = "yesbird:pitches";
  const outletIndexKey = "yesbird:outlets";

  return {
    async readPitch(id) {
      const raw = await call("GET", pitchKey(id));
      return typeof raw === "string" ? (JSON.parse(raw) as Pitch) : null;
    },
    async writePitch(id, pitch) {
      await call("SET", pitchKey(id), JSON.stringify(pitch));
      await call("SADD", pitchIndexKey, id);
    },
    async listPitches() {
      const ids = (await call("SMEMBERS", pitchIndexKey)) as string[];
      const pitches: Pitch[] = [];
      for (const id of ids) {
        const raw = await call("GET", pitchKey(id));
        if (typeof raw === "string") {
          pitches.push(JSON.parse(raw) as Pitch);
        }
      }
      return pitches;
    },

    async readOutlet(id) {
      const raw = await call("GET", outletKey(id));
      return typeof raw === "string" ? (JSON.parse(raw) as Outlet) : null;
    },
    async writeOutlet(id, outlet) {
      await call("SET", outletKey(id), JSON.stringify(outlet));
      await call("SADD", outletIndexKey, id);
    },
    async listOutlets() {
      const ids = (await call("SMEMBERS", outletIndexKey)) as string[];
      const outlets: Outlet[] = [];
      for (const id of ids) {
        const raw = await call("GET", outletKey(id));
        if (typeof raw === "string") {
          outlets.push(JSON.parse(raw) as Outlet);
        }
      }
      return outlets;
    },
  };
}

function pickBackend(): Backend {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? redisBackend(url, token) : fileBackend;
}

const backend = pickBackend();

function pitchDir() {
  return path.join(process.cwd(), "data", "pitches");
}

function pitchFileFor(id: string) {
  return path.join(pitchDir(), `${id}.json`);
}

function outletFileFor(id: string) {
  return path.join(pitchDir(), `outlet-${id}.json`);
}

// Pitch operations
export async function createPitch(input: CreatePitch): Promise<Pitch> {
  const id = randomBytes(9).toString("base64url");
  const pitch: Pitch = {
    ...input,
    id,
    responses: [],
    followUpCount: 0,
    createdAt: new Date(),
  };
  await backend.writePitch(id, pitch);
  return pitch;
}

export async function getPitch(id: string): Promise<Pitch | null> {
  if (!SAFE_ID.test(id)) return null;
  return backend.readPitch(id);
}

export async function updatePitch(id: string, updates: Partial<Pitch>): Promise<Pitch | null> {
  const existing = await getPitch(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates, updatedAt: new Date() };
  await backend.writePitch(id, updated);
  return updated;
}

export async function listPitches(): Promise<Pitch[]> {
  return backend.listPitches();
}

// Outlet operations
export async function createOutlet(input: CreateOutlet): Promise<Outlet> {
  const id = randomBytes(9).toString("base64url");
  const outlet: Outlet = {
    ...input,
    id,
    responseStats: {
      totalPitches: 0,
      responded: 0,
      responseRate: 0,
      avgResponseTime: 0,
    },
    createdAt: new Date(),
  };
  await backend.writeOutlet(id, outlet);
  return outlet;
}

export async function getOutlet(id: string): Promise<Outlet | null> {
  if (!SAFE_ID.test(id)) return null;
  return backend.readOutlet(id);
}

export async function updateOutlet(id: string, updates: Partial<Outlet>): Promise<Outlet | null> {
  const existing = await getOutlet(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates, updatedAt: new Date() };
  await backend.writeOutlet(id, updated);
  return updated;
}

export async function listOutlets(): Promise<Outlet[]> {
  return backend.listOutlets();
}
