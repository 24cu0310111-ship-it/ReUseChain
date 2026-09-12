import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runThreeArchitectureWorkflow } from "@/lib/langgraph/workflow";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { queryText, assetTag, liveTelemetry } = body;

    if (!queryText && !liveTelemetry) {
      return NextResponse.json({ success: false, error: "queryText or liveTelemetry is required" }, { status: 400 });
    }

    // 1. Resolve Device if asset tag provided, else pick first or generic
    let device: any = null;
    if (assetTag) {
      device = await prisma.device.findFirst({
        where: { OR: [{ assetTag }, { id: assetTag }] },
        include: { components: true },
      });
    }

    const text = (queryText || "").toLowerCase();
    const tempC = liveTelemetry?.tempC || (text.includes("hot") || text.includes("overheating") ? 88.0 : 42.0);
    const cpuLoad = liveTelemetry?.cpuLoadPercent || (text.includes("fan") || text.includes("slow") ? 92 : 35);
    const batteryWh = liveTelemetry?.batteryHealth || (text.includes("drain") || text.includes("battery") ? 48.0 : 85.0);
    const isOnline = liveTelemetry?.isOnline !== undefined ? liveTelemetry.isOnline : true;

    // 2. Execute Three-Architecture Workflow via Compiled LangGraph StateGraph
    const result = await runThreeArchitectureWorkflow({
      deviceId: device?.id || null,
      assetTag: device?.assetTag || assetTag || "ASSET-0142",
      rawInputChannel: queryText ? "chat" : "control_panel",
      userQuery: queryText || "",
      telemetry: {
        cpuLoad,
        tempC,
        batteryWh,
        isOnline,
      },
    });

    const isEscalated = result.triageVerdict === "escalate" || result.isNovelOrAmbiguous;

    if (isEscalated) {
      return NextResponse.json({
        success: true,
        isEscalated: true,
        escalationId: result.escalationId,
        triageSummary: "Novel or critical hardware condition detected. Execution paused and routed to Admin Escalation Queue for human verification and self-learning calibration.",
        recommendedAction: "Awaiting administrator response in Escalation Hub.",
        liveTelemetry: { tempC, cpuLoad, batteryWh },
        workflowTrace: result.executionHistory,
      });
    }

    const headlineMap: Record<string, string> = {
      repair: "Precision Preventative Repair",
      reuse: "Cross-Purpose Spares Harvesting",
      recycle: "Certified R2 E-Waste Recycling",
    };

    return NextResponse.json({
      success: true,
      isEscalated: false,
      recommendedPath: result.triageVerdict === "reuse" ? "cross_purpose_reuse" : result.triageVerdict,
      actionHeadline: headlineMap[result.triageVerdict] || "Autonomous Action Recommendation",
      detailedReasoning: result.verdictReasoning,
      dispatchAction: result.actionDispatched,
      heavyLoadWarning: result.heavyLoadWarning,
      loopIteration: result.loopIteration,
      passportHash: result.passportHash,
      liveTelemetry: {
        tempC,
        cpuLoad,
        batteryWh,
        status: result.heavyLoadWarning ? "Heavy Load Warning" : "Nominal",
      },
      workflowTrace: result.executionHistory,
    });
  } catch (error: any) {
    console.error("Diagnostic assistant error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
