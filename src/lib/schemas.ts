import { z } from "zod";
import {
  CONTACT_METHOD_IDS,
  MASCOTS,
  TIME_IDS,
  VIBE_IDS,
} from "@/lib/options";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date");

export const slotSchema = z.object({
  date: isoDate,
  times: z.array(z.enum(TIME_IDS)).min(1, "Pick at least one time"),
});
export type Slot = z.infer<typeof slotSchema>;

export const createInviteSchema = z.object({
  senderName: z.string().trim().min(1, "Tell them who's asking").max(40),
  recipientName: z.string().trim().min(1, "Who is this for?").max(40),
  message: z.string().trim().max(400).default(""),
  mascot: z.enum(MASCOTS),
  vibe: z.enum(VIBE_IDS).optional(),
  slots: z
    .array(slotSchema)
    .min(1, "Add at least one day you're free")
    .max(21),
});
export type CreateInviteInput = z.infer<typeof createInviteSchema>;

export const responseSchema = z.object({
  chosenSlots: z.array(slotSchema).min(1, "Pick at least one time that works"),
  foods: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  placeIdeas: z.string().trim().max(300).default(""),
  interests: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  notes: z.string().trim().max(500).default(""),
  phone: z
    .string()
    .trim()
    .min(6, "That number looks a little short")
    .max(30)
    .regex(/^[+\d\s().-]+$/, "Digits, spaces, + and dashes only"),
  email: z
    .union([z.literal(""), z.string().trim().email("That email looks off")])
    .default(""),
  contactMethod: z.enum(CONTACT_METHOD_IDS),
  contactHandle: z.string().trim().max(60).default(""),
  noAttempts: z.number().int().min(0).max(999).default(0),
});
export type ResponseInput = z.infer<typeof responseSchema>;

export type InviteResponse = ResponseInput & { respondedAt: string };

export type Invite = CreateInviteInput & {
  id: string;
  createdAt: string;
  response?: InviteResponse;
};

/** What the person being asked is allowed to see. */
export type PublicInvite = Omit<Invite, "response"> & {
  answered: boolean;
  chosenSlots?: Slot[];
};

export function toPublicInvite(invite: Invite): PublicInvite {
  const { response, ...rest } = invite;
  return {
    ...rest,
    answered: Boolean(response),
    chosenSlots: response?.chosenSlots,
  };
}
