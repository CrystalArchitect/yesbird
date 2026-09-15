import "server-only";

interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload?: {
    headers: Array<{ name: string; value: string }>;
    parts?: Array<{ mimeType: string; body: { data?: string } }>;
  };
  internalDate: string;
}

interface GmailThread {
  id: string;
  messages: GmailMessage[];
  snippet: string;
}

export interface GmailResponse {
  messageId: string;
  threadId: string;
  from: string;
  subject: string;
  content: string;
  receivedAt: Date;
  isAutoReply: boolean;
}

/**
 * Gmail API service for syncing pitch responses.
 * Requires GMAIL_API_KEY or GOOGLE_APPLICATION_CREDENTIALS for authentication.
 */
export class GmailService {
  private apiKey: string | null = null;
  private accessToken: string | null = null;

  constructor() {
    this.apiKey = process.env.GMAIL_API_KEY || null;
    this.accessToken = process.env.GMAIL_ACCESS_TOKEN || null;
  }

  /**
   * Search for messages matching a query in the user's inbox.
   * Requires authentication via API key or access token.
   */
  async searchMessages(query: string): Promise<GmailMessage[]> {
    if (!this.apiKey && !this.accessToken) {
      throw new Error("Gmail API key or access token not configured. Set GMAIL_API_KEY or GMAIL_ACCESS_TOKEN.");
    }

    try {
      const searchUrl = new URL("https://www.googleapis.com/gmail/v1/users/me/messages");
      searchUrl.searchParams.append("q", query);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (this.accessToken) {
        headers["Authorization"] = `Bearer ${this.accessToken}`;
      } else {
        searchUrl.searchParams.append("key", this.apiKey!);
      }

      const response = await fetch(searchUrl.toString(), { headers });

      if (!response.ok) {
        throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as { messages?: Array<{ id: string }> };
      return data.messages ? data.messages.map((m) => ({ id: m.id } as GmailMessage)) : [];
    } catch (err) {
      console.error("Failed to search Gmail messages:", err);
      throw err;
    }
  }

  /**
   * Retrieve full message content by ID.
   */
  async getMessage(messageId: string): Promise<GmailMessage | null> {
    if (!this.apiKey && !this.accessToken) {
      throw new Error("Gmail API key or access token not configured.");
    }

    try {
      const url = new URL(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (this.accessToken) {
        headers["Authorization"] = `Bearer ${this.accessToken}`;
      } else {
        url.searchParams.append("key", this.apiKey!);
      }

      const response = await fetch(url.toString(), { headers });

      if (response.status === 404) return null;
      if (!response.ok) {
        throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as GmailMessage;
    } catch (err) {
      console.error(`Failed to retrieve Gmail message ${messageId}:`, err);
      throw err;
    }
  }

  /**
   * Check if a message is an auto-reply (vacation responder, auto-reply, etc).
   */
  private isAutoReply(message: GmailMessage): boolean {
    if (!message.payload?.headers) return false;

    const headers = message.payload.headers.reduce(
      (acc, h) => {
        acc[h.name.toLowerCase()] = h.value;
        return acc;
      },
      {} as Record<string, string>
    );

    // Check for common auto-reply headers
    const autoReplyIndicators = [
      "x-autoresponse-suppress",
      "x-mailer",
      "precedence",
      "subject",
    ];

    for (const indicator of autoReplyIndicators) {
      const value = headers[indicator] || "";
      if (
        value.toLowerCase().includes("auto") ||
        value.toLowerCase().includes("vacation") ||
        value.toLowerCase().includes("ooo") ||
        value.toLowerCase().includes("out of office")
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Extract text content from a message.
   */
  private extractMessageContent(message: GmailMessage): string {
    if (!message.payload) return message.snippet || "";

    const parts = message.payload.parts || [];
    let content = "";

    for (const part of parts) {
      if (part.mimeType === "text/plain" || part.mimeType === "text/html") {
        const data = part.body?.data;
        if (data) {
          content += Buffer.from(data, "base64").toString("utf-8");
        }
      }
    }

    return content || message.snippet || "";
  }

  /**
   * Extract sender email and name from headers.
   */
  private extractSender(message: GmailMessage): { email: string; name: string } {
    if (!message.payload?.headers) return { email: "", name: "" };

    const fromHeader = message.payload.headers.find((h) => h.name.toLowerCase() === "from")?.value || "";

    // Parse "Name <email@example.com>" format
    const emailMatch = fromHeader.match(/<(.+?)>/);
    const email = emailMatch ? emailMatch[1] : fromHeader;
    const name = fromHeader.replace(/<.+?>/, "").trim() || email;

    return { email, name };
  }

  /**
   * Extract subject from headers.
   */
  private extractSubject(message: GmailMessage): string {
    if (!message.payload?.headers) return "";
    return message.payload.headers.find((h) => h.name.toLowerCase() === "subject")?.value || "";
  }

  /**
   * Convert a Gmail message to a GmailResponse object.
   */
  async messageToResponse(message: GmailMessage): Promise<GmailResponse> {
    const sender = this.extractSender(message);
    const subject = this.extractSubject(message);
    const content = this.extractMessageContent(message);
    const isAutoReply = this.isAutoReply(message);

    return {
      messageId: message.id,
      threadId: message.threadId,
      from: sender.email,
      subject,
      content,
      receivedAt: new Date(parseInt(message.internalDate, 10)),
      isAutoReply,
    };
  }

  /**
   * Sync responses for a given pitch.
   * Searches for messages to/from the contact email matching the pitch subject.
   */
  async syncPitchResponses(contactEmail: string, pitchSubject: string, sentAfter?: Date): Promise<GmailResponse[]> {
    try {
      // Build query: messages to/from contact with pitch subject in thread
      const afterDate = sentAfter ? Math.floor(sentAfter.getTime() / 1000) : null;
      let query = `from:${contactEmail} OR to:${contactEmail}`;
      if (afterDate) {
        query += ` after:${afterDate}`;
      }

      const messages = await this.searchMessages(query);

      const responses: GmailResponse[] = [];
      for (const msg of messages) {
        try {
          const fullMessage = await this.getMessage(msg.id);
          if (fullMessage) {
            const response = await this.messageToResponse(fullMessage);
            // Filter for responses that match the pitch subject or are in a relevant thread
            if (response.subject.toLowerCase().includes(pitchSubject.toLowerCase()) ||
                response.subject.toLowerCase().startsWith("re:")) {
              responses.push(response);
            }
          }
        } catch (err) {
          console.error(`Failed to process message ${msg.id}:`, err);
        }
      }

      return responses;
    } catch (err) {
      console.error(`Failed to sync responses for ${contactEmail}:`, err);
      throw err;
    }
  }
}

// Export singleton instance
export const gmailService = new GmailService();
