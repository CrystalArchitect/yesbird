import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CreateInviteInput, Invite, ResponseInput } from "@/lib/schemas";

// Invitations live as one JSON file each. The public id is derived from the
// asker's private key, so a key always resolves to its invite without an index,
// while the id alone can never be turned back into the key.
const DATA_DIR = process.env.YESBIRD_DATA_DIR ?? path.join(process.cwd(), "data", "invites");
const SAFE_ID = /^[A-Za-z0-9_-]{6,64}$/;

export function idFromManageKey(manageKey: string): string {
  return createHash("sha256").update(manageKey).digest("base64url").slice(0, 12);
}

function fileFor(id: string) {
  if (!SAFE_ID.test(id)) throw new Error("Invalid invite id");
  return path.join(DATA_DIR, `${id}.json`);
}

async function writeAtomic(file: string, data: unknown) {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await rename(tmp, file);
}

export async function createInvite(
  input: CreateInviteInput,
): Promise<{ invite: Invite; manageKey: string }> {
  const manageKey = randomBytes(18).toString("base64url");
  const invite: Invite = {
    ...input,
    id: idFromManageKey(manageKey),
    createdAt: new Date().toISOString(),
  };
  await writeAtomic(fileFor(invite.id), invite);
  return { invite, manageKey };
}

export async function getInvite(id: string): Promise<Invite | null> {
  if (!SAFE_ID.test(id)) return null;
  try {
    const raw = await readFile(fileFor(id), "utf8");
    return JSON.parse(raw) as Invite;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
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
  await writeAtomic(fileFor(id), updated);
  return updated;
}
