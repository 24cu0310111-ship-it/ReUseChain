import { NextRequest, NextResponse } from "next/server";
import { runLangGraphWorkflow } from "@/lib/langgraph/workflow";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json({ success: false, error: "deviceId is required" }, { status: 400 });
    }

    // Execute the LangGraph Multi-Agent StateGraph
    const result = await runLangGraphWorkflow(deviceId);

    return NextResponse.json({
      success: true,
      dossier: {
        deviceId: result.deviceId,
        deviceModel: result.deviceModel,
        componentId: result.targetComponent?.id,
        componentType: result.targetComponent?.type,
        recommendedPath: result.recommendedPath,
        confidenceScore: result.confidenceScore,
        justification: result.justification,
        riskTier: result.riskTier,
        evidence: {
          healthData: result.targetComponent,
          partMatch: result.partMatch,
          quote: result.quote,
          repairScore: result.repairScore,
          economicViability: result.economicViability,
          reuseOptions: result.reuseOptions,
          recyclerMatch: result.recyclerMatch,
          blockers: result.blockers,
        },
        actionsTaken: result.executionHistory,
      },
    });
  } catch (error: any) {
    console.error("LangGraph Evaluation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
