import { z } from "zod";

export const OutletContactSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  notes: z.string().optional(),
});

export const OutletResponseStatsSchema = z.object({
  totalPitches: z.number().default(0),
  responded: z.number().default(0),
  responseRate: z.number().default(0),
  avgResponseTime: z.number().default(0), // ms
});

export const OutletSchema = z.object({
  id: z.string(),
  name: z.string(),
  website: z.string().url().optional(),
  categories: z.array(z.string()),

  contacts: z.array(OutletContactSchema),

  responseStats: OutletResponseStatsSchema,
  tags: z.array(z.string()).default([]),

  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

export type Outlet = z.infer<typeof OutletSchema>;
export type OutletContact = z.infer<typeof OutletContactSchema>;

export const PitchResponseSchema = z.object({
  receivedAt: z.date(),
  type: z.enum(["auto_reply", "manual", "gmail_thread"]),
  content: z.string(),
  responder: z.string(),
  sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
});

export const PitchSchema = z.object({
  id: z.string(),
  outletId: z.string(),
  contactEmail: z.string().email(),
  contactName: z.string(),

  subject: z.string(),
  body: z.string(),
  attachments: z.array(z.string()).optional(),

  sentAt: z.date().optional(),
  status: z.enum(["draft", "sent", "responded", "bounced", "no_response"]),

  responses: z.array(PitchResponseSchema).default([]),

  followUpCount: z.number().default(0),
  nextFollowUpAt: z.date().optional(),

  tags: z.array(z.string()).default([]),

  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

export type Pitch = z.infer<typeof PitchSchema>;
export type PitchResponse = z.infer<typeof PitchResponseSchema>;

export const CreatePitchSchema = PitchSchema.omit({
  id: true,
  sentAt: true,
  responses: true,
  followUpCount: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: z.enum(["draft", "sent"]).default("draft"),
});

export type CreatePitch = z.infer<typeof CreatePitchSchema>;

export const CreateOutletSchema = OutletSchema.omit({
  id: true,
  responseStats: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateOutlet = z.infer<typeof CreateOutletSchema>;
