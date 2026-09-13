import { z } from "zod";

export const CampaignRecipientSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  metadata: z.record(z.any()).optional(),
});

export const CampaignStatsSchema = z.object({
  totalSent: z.number().default(0),
  opens: z.number().default(0),
  clicks: z.number().default(0),
  bounces: z.number().default(0),
  unsubscribes: z.number().default(0),
});

export const CampaignTrackingSchema = z.object({
  pixelId: z.string(),
  linkTracking: z.boolean().default(true),
});

export const CampaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  template: z.enum(["newsletter", "announcement", "custom"]),
  subject: z.string(),
  htmlBody: z.string(),
  textBody: z.string(),
  fromEmail: z.string().email(),
  fromName: z.string(),

  recipientList: z.object({
    type: z.enum(["csv", "inline", "outlet_list"]),
    recipients: z.array(CampaignRecipientSchema),
  }),

  sentAt: z.date().optional(),
  stats: CampaignStatsSchema,

  tracking: CampaignTrackingSchema,

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Campaign = z.infer<typeof CampaignSchema>;
export type CampaignRecipient = z.infer<typeof CampaignRecipientSchema>;
export type CampaignStats = z.infer<typeof CampaignStatsSchema>;

export const CreateCampaignSchema = CampaignSchema.omit({
  id: true,
  stats: true,
  sentAt: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateCampaign = z.infer<typeof CreateCampaignSchema>;
