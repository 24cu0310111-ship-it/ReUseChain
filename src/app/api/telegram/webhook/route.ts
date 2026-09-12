import { NextRequest, NextResponse } from "next/server";
import { parseTelegramAdminCommand, getSimulatedTelegramQueue } from "@/lib/telegram-service";
import { recordLearnedResolution } from "@/lib/self-learning-agent";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Standard Telegram Webhook payload structure: { update_id, message: { from, chat, text, ... } }
    const message = body.message || body;
    const text = message.text || message.caption || body.command || "";
    const fromUser = message.from?.first_name 
      ? `${message.from.first_name} ${message.from.last_name || ""}`.trim()
      : "Lead Systems Administrator (via Telegram)";
    const chatId = message.chat?.id || body.chatId;

    if (!text) {
      return NextResponse.json({ ok: true, note: "Ignored empty message" });
    }

    const parsed = parseTelegramAdminCommand(text);

    if (parsed.command === "reply" && parsed.ticketId && parsed.resolutionMessage) {
      // Look up target escalation ticket
      let targetId = parsed.ticketId;
      let esc = await prisma.adminEscalation.findUnique({ where: { id: targetId } });

      // Fallback: search by prefix match or recent pending ticket if user provided short ID
      if (!esc) {
        const pending = await prisma.adminEscalation.findMany({
          where: { status: "pending" },
          orderBy: { createdAt: "desc" },
          take: 5,
        });
        const matched = pending.find((p) => p.id.startsWith(targetId) || targetId.includes(p.id.slice(0, 6)));
        if (matched) {
          esc = matched;
          targetId = matched.id;
        }
      }

      if (!esc) {
        return NextResponse.json({
          ok: false,
          error: `Escalation ticket #${targetId} not found in database`,
          telegramReply: `⚠️ Error: Could not find pending ticket #${targetId}. Check ticket ID and try again.`
        }, { status: 404 });
      }

      // Record learned resolution and seal in Passport
      const resolution = await recordLearnedResolution({
        escalationId: targetId,
        adminResponse: parsed.resolutionMessage,
        resolvedBy: `${fromUser} (via Telegram Bot)`,
      });

      // Deliver to user channel (Telegram Backup Bot or active Web Session)
      const { deliverResolutionToUserChat } = await import("@/lib/telegram-service");
      await deliverResolutionToUserChat(targetId, parsed.resolutionMessage);

      const responseText = [
        `✅ *[ESCALATION RESOLVED & DELIVERED]*`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `🎫 *Ticket:* \`${targetId}\``,
        `👤 *Resolved by:* ${fromUser}`,
        `💬 *Message Sent to User Chat:*`,
        `"${parsed.resolutionMessage}"`,
        ``,
        `🧠 *Self-Learning Model Calibrated:*`,
        `_Rule permanently committed to knowledge base. Future occurrences of this issue will now be solved autonomously by the AI!_`,
        `🔐 *Passport Hash:* \`${resolution.passportHash.slice(0, 16)}...\``
      ].join("\n");

      return NextResponse.json({
        ok: true,
        action: "resolution_recorded",
        ticketId: targetId,
        telegramReply: responseText,
        passportHash: resolution.passportHash,
      });
    }

    if (parsed.command === "status") {
      const pendingCount = await prisma.adminEscalation.count({ where: { status: "pending" } });
      return NextResponse.json({
        ok: true,
        telegramReply: `📊 *System Status:* ${pendingCount} escalations pending admin review. Use /reply <ticketId> <message> to respond.`
      });
    }

    // Default help response
    return NextResponse.json({
      ok: true,
      telegramReply: `🤖 *ReUseChain Admin Triage Bot*\nCommands:\n• \`/reply <ticketId> <resolution>\` - Deliver solution to user chat and train the AI\n• \`/status\` - View pending escalation queue`
    });

  } catch (error: any) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const queue = getSimulatedTelegramQueue();
  const pendingCount = await prisma.adminEscalation.count({ where: { status: "pending" } });

  return NextResponse.json({
    status: "active",
    endpoint: "/api/telegram/webhook",
    pendingEscalationsCount: pendingCount,
    recentDispatches: queue.slice(0, 10),
  });
}
