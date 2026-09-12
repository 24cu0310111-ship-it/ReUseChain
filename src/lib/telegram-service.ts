import * as crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const TELEGRAM_ADMIN_BOT_TOKEN =
  process.env.TELEGRAM_ADMIN_BOT_TOKEN ||
  process.env.TELEGRAM_BOT_TOKEN ||
  "8978711876:AAGGiaYKOVyQl43v5dyQKfnmLuoFZmtpJ2I";

export const TELEGRAM_BACKUP_BOT_TOKEN =
  process.env.TELEGRAM_BACKUP_BOT_TOKEN ||
  "8923070582:AAHPGMWVsKAnhMsFT9aMbbCZ4vpuPfK8IrM";

export interface TelegramEscalationPayload {
  escalationId: string;
  assetTag: string;
  queryText: string;
  symptomSummary: string;
  telemetrySnippet?: string;
  urgency: string;
  mediaUrl?: string;
  sourceChannel?: string;
  telegramChatId?: string;
  createdAt: Date;
}

export interface TelegramAdminReplyParsed {
  command: "reply" | "status" | "help" | "unknown";
  ticketId?: string;
  resolutionMessage?: string;
  rawText: string;
}

// In-memory simulation queue for dev & demonstration verification
export interface SimulatedTelegramMessage {
  id: string;
  chatId: string;
  text: string;
  mediaUrl?: string;
  sentAt: string;
  deliveredToTelegramApi: boolean;
  status: "dispatched" | "simulated";
}

const telegramSimQueue: SimulatedTelegramMessage[] = [];

/**
 * Sends a Markdown-formatted message to any Telegram Chat using the provided token
 */
export async function sendTelegramMessage(
  token: string,
  chatId: string | number,
  text: string,
  parseMode: string = "Markdown"
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, messageId: String(data?.result?.message_id) };
    } else {
      const errText = await res.text();
      console.warn(`Telegram sendMessage failed (${res.status}):`, errText);
      return { success: false, error: errText };
    }
  } catch (err: any) {
    console.warn("Telegram sendMessage network exception:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Downloads a Telegram file (photo or document) and converts it into a base64 data URL
 */
export async function downloadTelegramFileAsBase64(
  token: string,
  fileId: string
): Promise<string | null> {
  try {
    const getFileUrl = `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`;
    const fileRes = await fetch(getFileUrl);
    if (!fileRes.ok) return null;
    const fileJson = await fileRes.json();
    const filePath = fileJson?.result?.file_path;
    if (!filePath) return null;

    const downloadUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
    const dlRes = await fetch(downloadUrl);
    if (!dlRes.ok) return null;

    const arrayBuffer = await dlRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = filePath.endsWith(".png") ? "image/png" : "image/jpeg";
    return `data:${mimeType};base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.warn("Error downloading Telegram photo:", err);
    return null;
  }
}

/**
 * Dispatch formatted Admin Escalation alert to Admin Telegram Bot (@AHackBattle013bot)
 */
export async function dispatchEscalationToTelegram(
  payload: TelegramEscalationPayload
): Promise<{ success: boolean; mode: "live_telegram" | "simulated_gateway"; messageId?: string }> {
  const botToken = TELEGRAM_ADMIN_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  const originText = payload.sourceChannel === "telegram_backup_bot" 
    ? "📱 *Origin:* Backup Telegram Bot (Mobile Device - PC Offline / Drive Failure)"
    : "💻 *Origin:* Web Chat Console";

  const formattedText = [
    `🚨 *[NEW ESCALATION REQUEST]* 🚨`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🎫 *Ticket ID:* \`${payload.escalationId}\``,
    `💻 *Asset Tag:* \`${payload.assetTag}\``,
    `⚡ *Urgency:* *${payload.urgency.toUpperCase()}*`,
    originText,
    payload.telegramChatId ? `💬 *User Chat ID:* \`${payload.telegramChatId}\`` : "",
    ``,
    `👤 *User Issue Query:*`,
    `"${payload.queryText}"`,
    ``,
    `🔍 *Symptom & Vision Analysis:*`,
    `${payload.symptomSummary}`,
    ``,
    payload.telemetrySnippet ? `📊 *Host Telemetry:* \`${payload.telemetrySnippet}\`\n` : "",
    payload.mediaUrl ? `📸 *Media Attached:* [Task Manager / Screen Screenshot Included]\n` : "",
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `👉 *To respond and train the AI, reply with:*`,
    `\`/reply ${payload.escalationId} <Your diagnostic solution & guidance>\``,
    ``,
    `_Your reply will be immediately delivered to the user's active session (${payload.sourceChannel === "telegram_backup_bot" ? "Backup Telegram App" : "Web Chat"}) and stored in the permanent self-learning memory._`
  ].filter(Boolean).join("\n");

  // Attempt live delivery to Admin chat or registered admin IDs
  let liveSent = false;
  let liveMsgId: string | undefined;

  // If specific ADMIN_CHAT_ID is set, dispatch directly to admin
  if (adminChatId) {
    const sendResult = await sendTelegramMessage(botToken, adminChatId, formattedText);
    if (sendResult.success) {
      liveSent = true;
      liveMsgId = sendResult.messageId;
    }
  }

  // Queue in simulation queue for audit & UI inspection
  const simMessage: SimulatedTelegramMessage = {
    id: `tg-alert-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
    chatId: adminChatId || "admin-channel",
    text: formattedText,
    mediaUrl: payload.mediaUrl,
    sentAt: new Date().toISOString(),
    deliveredToTelegramApi: liveSent,
    status: liveSent ? "dispatched" : "simulated",
  };

  telegramSimQueue.unshift(simMessage);
  if (telegramSimQueue.length > 50) telegramSimQueue.pop();

  return {
    success: true,
    mode: liveSent ? "live_telegram" : "simulated_gateway",
    messageId: liveMsgId || simMessage.id
  };
}

/**
 * Delivers Admin's resolution message to the end-user's channel (Telegram Backup Bot or Web Chat)
 */
export async function deliverResolutionToUserChat(
  escalationId: string,
  resolutionText: string
): Promise<{ deliveredToTelegram: boolean; targetChatId?: string }> {
  const escalation = await prisma.adminEscalation.findUnique({
    where: { id: escalationId },
  });

  if (!escalation) {
    return { deliveredToTelegram: false };
  }

  // If this came from the Backup Telegram bot and has a chatId, send message directly to user's Telegram!
  if (escalation.telegramChatId) {
    const userMessage = [
      `👨‍💻 *[Response from Lead Systems Administrator]*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `🎫 *Regarding Ticket:* \`${escalationId.slice(0, 8)}\``,
      ``,
      `💬 *Verified Resolution & Instructions:*`,
      `${resolutionText}`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `🧠 *Self-Learning AI Updated:* Our diagnostic model has permanently learned this protocol and will auto-apply it to future occurrences.`,
      ``,
      `_Need more help? Type 'book technician', 'track', 'reuse', or describe any other issue!_`
    ].join("\n");

    const sendRes = await sendTelegramMessage(
      TELEGRAM_BACKUP_BOT_TOKEN,
      escalation.telegramChatId,
      userMessage
    );

    return {
      deliveredToTelegram: sendRes.success,
      targetChatId: escalation.telegramChatId,
    };
  }

  return { deliveredToTelegram: false };
}

/**
 * Parses incoming Telegram message from Admin (e.g. "/reply ESC-1234 Fix driver")
 */
export function parseTelegramAdminCommand(text: string): TelegramAdminReplyParsed {
  const trimmed = (text || "").trim();

  // Pattern 1: /reply <ticketId> <resolution>
  const replyMatch = trimmed.match(/^\/reply\s+([a-zA-Z0-9_-]+)\s+([\s\S]+)$/i);
  if (replyMatch) {
    return {
      command: "reply",
      ticketId: replyMatch[1],
      resolutionMessage: replyMatch[2].trim(),
      rawText: trimmed,
    };
  }

  // Pattern 2: TicketId: <ticketId> \n <resolution>
  const colonMatch = trimmed.match(/^(?:ticket|esc)[:\s]+([a-zA-Z0-9_-]+)[\r\n\s]+([\s\S]+)$/i);
  if (colonMatch) {
    return {
      command: "reply",
      ticketId: colonMatch[1],
      resolutionMessage: colonMatch[2].trim(),
      rawText: trimmed,
    };
  }

  if (trimmed.startsWith("/status")) {
    return { command: "status", rawText: trimmed };
  }

  if (trimmed.startsWith("/help") || trimmed.startsWith("/start")) {
    return { command: "help", rawText: trimmed };
  }

  return {
    command: "unknown",
    rawText: trimmed,
  };
}

/**
 * Get recent simulated Telegram messages for inspection or testing
 */
export function getSimulatedTelegramQueue(): SimulatedTelegramMessage[] {
  return [...telegramSimQueue];
}

