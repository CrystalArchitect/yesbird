import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { getSMTPConfigFromEnv, validateSMTPConfig, getSMTPTransporter } from "@/lib/smtp-config";
import type { SMTPConfig } from "@/lib/smtp-config";

describe("SMTP Configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("validateSMTPConfig", () => {
    it("should validate a correct SMTP config", () => {
      const config = {
        host: "smtp.example.com",
        port: 587,
        user: "test@example.com",
        password: "password123",
      };

      const result = validateSMTPConfig(config);
      expect(result).toMatchObject({
        host: "smtp.example.com",
        port: 587,
        user: "test@example.com",
        password: "password123",
      });
    });

    it("should apply defaults for TLS and fromName", () => {
      const config = {
        host: "smtp.example.com",
        port: 587,
        user: "test@example.com",
        password: "password123",
      };

      const result = validateSMTPConfig(config);
      expect(result.tls).toBe(true);
      expect(result.fromName).toBe("Yesbird");
    });

    it("should reject missing SMTP_HOST", () => {
      const config = {
        port: 587,
        user: "test@example.com",
        password: "password123",
      };

      expect(() => validateSMTPConfig(config)).toThrow();
    });

    it("should reject invalid port", () => {
      const config = {
        host: "smtp.example.com",
        port: 99999,
        user: "test@example.com",
        password: "password123",
      };

      expect(() => validateSMTPConfig(config)).toThrow();
    });
  });

  describe("getSMTPConfigFromEnv", () => {
    it("should return null when SMTP_HOST is not set", () => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_PORT;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASSWORD;

      const config = getSMTPConfigFromEnv();
      expect(config).toBeNull();
    });

    it("should return null when any required env var is missing", () => {
      process.env.SMTP_HOST = "smtp.example.com";
      process.env.SMTP_PORT = "587";
      process.env.SMTP_USER = "test@example.com";
      delete process.env.SMTP_PASSWORD;

      const config = getSMTPConfigFromEnv();
      expect(config).toBeNull();
    });

    it("should parse and return SMTP config from environment", () => {
      process.env.SMTP_HOST = "smtp.example.com";
      process.env.SMTP_PORT = "587";
      process.env.SMTP_USER = "test@example.com";
      process.env.SMTP_PASSWORD = "password123";
      process.env.SMTP_FROM_NAME = "MyApp";
      process.env.SMTP_TLS = "true";

      const config = getSMTPConfigFromEnv();
      expect(config).not.toBeNull();
      expect(config?.host).toBe("smtp.example.com");
      expect(config?.port).toBe(587);
      expect(config?.user).toBe("test@example.com");
      expect(config?.password).toBe("password123");
      expect(config?.fromName).toBe("MyApp");
      expect(config?.tls).toBe(true);
    });

    it("should handle SMTP_TLS=false", () => {
      process.env.SMTP_HOST = "smtp.example.com";
      process.env.SMTP_PORT = "25";
      process.env.SMTP_USER = "test@example.com";
      process.env.SMTP_PASSWORD = "password123";
      process.env.SMTP_TLS = "false";

      const config = getSMTPConfigFromEnv();
      expect(config?.tls).toBe(false);
    });

    it("should log error and return null for invalid config", () => {
      process.env.SMTP_HOST = "smtp.example.com";
      process.env.SMTP_PORT = "invalid-port";
      process.env.SMTP_USER = "test@example.com";
      process.env.SMTP_PASSWORD = "password123";

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const config = getSMTPConfigFromEnv();
      expect(config).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Invalid SMTP configuration"), expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe("getSMTPTransporter", () => {
    it("should create a transporter with correct config", () => {
      const config: SMTPConfig = {
        host: "smtp.example.com",
        port: 587,
        user: "test@example.com",
        password: "password123",
        fromName: "Test App",
        tls: true,
      };

      const transporter = getSMTPTransporter(config);
      expect(transporter).toBeDefined();
      expect(transporter.get).toBeDefined();
    });

    it("should use secure=true when port=465 and tls=true", () => {
      const config: SMTPConfig = {
        host: "smtp.example.com",
        port: 465,
        user: "test@example.com",
        password: "password123",
        fromName: "Test App",
        tls: true,
      };

      const transporter = getSMTPTransporter(config);
      const options = transporter.get("smtp");

      expect(options.secure).toBe(true);
    });

    it("should use secure=false when port!=465", () => {
      const config: SMTPConfig = {
        host: "smtp.example.com",
        port: 587,
        user: "test@example.com",
        password: "password123",
        fromName: "Test App",
        tls: true,
      };

      const transporter = getSMTPTransporter(config);
      const options = transporter.get("smtp");

      expect(options.secure).toBe(false);
    });

    it("should configure connection pool", () => {
      const config: SMTPConfig = {
        host: "smtp.example.com",
        port: 587,
        user: "test@example.com",
        password: "password123",
        fromName: "Test App",
        tls: true,
      };

      const transporter = getSMTPTransporter(config);
      const options = transporter.get("smtp");

      expect(options.pool).toBeDefined();
      expect(options.pool.maxConnections).toBe(5);
      expect(options.pool.maxMessages).toBe(100);
    });
  });

  describe("Delivery Priority", () => {
    it("should prioritize Resend over SMTP", () => {
      process.env.RESEND_API_KEY = "re_test_key";
      process.env.SMTP_HOST = "smtp.example.com";
      process.env.SMTP_PORT = "587";
      process.env.SMTP_USER = "test@example.com";
      process.env.SMTP_PASSWORD = "password123";

      expect(process.env.RESEND_API_KEY).toBe("re_test_key");
      expect(getSMTPConfigFromEnv()).not.toBeNull();
    });

    it("should prioritize SMTP over webhook", () => {
      delete process.env.RESEND_API_KEY;
      process.env.SMTP_HOST = "smtp.example.com";
      process.env.SMTP_PORT = "587";
      process.env.SMTP_USER = "test@example.com";
      process.env.SMTP_PASSWORD = "password123";
      process.env.NOTIFY_WEBHOOK_URL = "https://webhook.example.com";

      expect(getSMTPConfigFromEnv()).not.toBeNull();
      expect(process.env.NOTIFY_WEBHOOK_URL).toBe("https://webhook.example.com");
    });
  });
});
