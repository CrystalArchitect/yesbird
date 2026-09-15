import nodemailer from "nodemailer";
import { z } from "zod";

const SMTPConfigSchema = z.object({
  host: z.string().min(1, "SMTP_HOST is required"),
  port: z.number().min(1).max(65535, "SMTP_PORT must be between 1 and 65535"),
  user: z.string().min(1, "SMTP_USER is required"),
  password: z.string().min(1, "SMTP_PASSWORD is required"),
  fromName: z.string().default("Yesbird"),
  tls: z.boolean().default(true),
});

export type SMTPConfig = z.infer<typeof SMTPConfigSchema>;

let transporterInstance: nodemailer.Transporter | null = null;

export function validateSMTPConfig(config: Partial<SMTPConfig>): SMTPConfig {
  return SMTPConfigSchema.parse(config);
}

export function getSMTPTransporter(config: SMTPConfig): nodemailer.Transporter {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.tls && config.port === 465,
    auth: {
      user: config.user,
      pass: config.password,
    },
    pool: {
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 4000,
      rateLimit: 14,
    },
  });
}

export function getSMTPConfigFromEnv(): SMTPConfig | null {
  const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD"];
  const hasAll = required.every((key) => process.env[key]);

  if (!hasAll) {
    return null;
  }

  try {
    return validateSMTPConfig({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
      fromName: process.env.SMTP_FROM_NAME || "Yesbird",
      tls: process.env.SMTP_TLS !== "false",
    });
  } catch (error) {
    console.error("Invalid SMTP configuration:", error);
    return null;
  }
}

export function getCachedTransporter(config: SMTPConfig): nodemailer.Transporter {
  if (!transporterInstance) {
    transporterInstance = getSMTPTransporter(config);
  }
  return transporterInstance;
}

export function closeSMTPTransporter(): Promise<void> {
  if (transporterInstance) {
    return transporterInstance.close();
  }
  return Promise.resolve();
}
