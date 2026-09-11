import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CreateInviteInput, Invite, ResponseInput } from "@/lib/schemas";

// Invitations are stored one record each. The public id is derived from the
// asker's private key, so a key always resolves to its invite without an index,
// while the id alone can never be turned back into the key.
//
// Two backends, chosen from the environment:
//   - Upstash Redis (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN): for serverless hosts
//     like Vercel where the filesystem is not persistent.
//   - JSON files under YESBIRD_DATA_DIR (default ./data/invites): local dev and single-server hosts.
const SAFE_ID = /^[A-Za-z0-9_-]{6,64}$/;

type Backend = {
  read(id: string): Promise<Invite | null>;
  write(id: string, invite: Invite): Promise<void>;
};

const fileBackend: Backend = {
  async read(id) {
    try {
      const raw = await readFile(fileFor(id), "utf8");
      return JSON.parse(raw) as Invite;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw err;
    }
  },
  async write(id, invite) {
    const file = fileFor(id);
    await mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tmp, JSON.stringify(invite, null, 2), "utf8");
    await rename(tmp, file);
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
  const key = (id: string) => `yesbird:invite:${id}`;
  return {
    async read(id) {
      const raw = await call("GET", key(id));
      return typeof raw === "string" ? (JSON.parse(raw) as Invite) : null;
    },
    async write(id, invite) {
      await call("SET", key(id), JSON.stringify(invite));
    },
  };
}

function pickBackend(): Backend {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? redisBackend(url, token) : fileBackend;
}

const backend = pickBackend();

function fileFor(id: string) {
  const dir = process.env.YESBIRD_DATA_DIR ?? path.join(process.cwd(), "data", "invites");
  return path.join(dir, `${id}.json`);
}

export function idFromManageKey(manageKey: string): string {
  return createHash("sha256").update(manageKey).digest("base64url").slice(0, 12);
}

export async function createInvite(
  input: CreateInviteInput,
): Promise<{ invite: Invite; manageKey: string }> {
  const manageKey = randomBytes(18).toString("base64url");
  const invite: Invite = {
    ...input,
    id: idFromManageKey(manageKey),
    manageKey,
    createdAt: new Date().toISOString(),
  };
  await backend.write(invite.id, invite);
  return { invite, manageKey };
}

export async function getInvite(id: string): Promise<Invite | null> {
  if (!SAFE_ID.test(id)) return null;
  return backend.read(id);
}

export async function getInviteByManageKey(manageKey: string): Promise<Invite | null> {
  if (!SAFE_ID.test(manageKey)) return null;
  return getInvite(idFromManageKey(manageKey));
}

export async function saveResponse(
  id: string,
  response: ResponseInput,
): Promise<Invite | { error: "not_found" | "already_answered" }> {
  const invite = await getInvite(id);
  if (!invite) return { error: "not_found" };
  if (invite.response) return { error: "already_answered" };
  const updated: Invite = {
    ...invite,
    response: { ...response, respondedAt: new Date().toISOString() },
  };
  await backend.write(id, updated);
  return updated;
}
