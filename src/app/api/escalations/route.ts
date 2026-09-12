import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as crypto from "crypto";

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function GET() {
  try {
    const escalations = await prisma.adminEscalation.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: escalations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { escalationId, adminResponse, learnedRule, resolvedBy } = body;

    if (!escalationId || !adminResponse) {
      return NextResponse.json(
        { success: false, error: "escalationId and adminResponse are required" },
        { status: 400 }
      );
    }

    const updated = await prisma.adminEscalation.update({
      where: { id: escalationId },
      data: {
        adminResponse,
        learnedRule: learnedRule || "Adaptive rule recorded into persistent knowledge base.",
        resolvedBy: resolvedBy || "Lead Systems Administrator",
        status: "resolved",
      },
    });

    // Anchor the self-learning milestone into Circularity Passport
    const dev = updated.deviceId 
      ? await prisma.device.findUnique({ where: { id: updated.deviceId } })
      : await prisma.device.findFirst();
    const deviceId = dev?.id || (await prisma.device.findFirst())?.id;

    if (deviceId) {
      const eventHash = sha256(`ADMIN_LEARNED:${escalationId}:${adminResponse}:${Date.now()}`);
      const lastEvent = await prisma.passportEvent.findFirst({ orderBy: { timestamp: "desc" } });
      const prevHash = lastEvent ? lastEvent.eventHash : "GENESIS_BLOCK_000000000000000000000000000000000000";

      await prisma.passportEvent.create({
        data: {
          deviceId,
          eventCategory: "control",
          eventType: "SELF_LEARNING_RULE_RECORDED",
          actor: resolvedBy || "Lead Systems Administrator",
          description: `Agent learned new rule from admin escalation: ${adminResponse.slice(0, 160)}`,
          eventHash,
          prevHash,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Escalation resolved! Knowledge model calibrated and sealed in Circularity Passport.",
    });
  } catch (error: any) {
    console.error("Escalation resolution error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
