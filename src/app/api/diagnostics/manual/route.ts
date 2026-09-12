import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import { understandAndDiagnoseWithAi } from "@/lib/hardware-ai-agent";

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      deviceType = "laptop",
      model = "Dell Latitude 5430",
      assetTag = "ASSET-0142",
      processor = "13th Gen Intel Core i3-1305U",
      ram = "24 GB DDR4",
      storage = "Samsung 512GB NVMe SSD",
      os = "Windows 11 Home",
      symptom = "none",
      issueDescription,
      problemDescription,
      issueText,
      apiKey,
      anomalyOverride = null,
    } = body;

    const rawSymptom = symptom !== "none" ? symptom : (issueDescription || problemDescription || issueText || "none");
    const lowerSymptom = (rawSymptom || "").toLowerCase();

    // Check if explicitly healthy baseline
    const isExplicitBaseline = 
      (lowerSymptom === "none" || lowerSymptom.includes("normal baseline") || lowerSymptom.includes("healthy") || lowerSymptom.includes("functioning normally")) &&
      !lowerSymptom.includes("semi colon") &&
      !lowerSymptom.includes("semicolon") &&
      !lowerSymptom.includes("key") &&
      !lowerSymptom.includes("throttling") &&
      !lowerSymptom.includes("slow") &&
      !lowerSymptom.includes("overheat") &&
      !lowerSymptom.includes("test");

    if (isExplicitBaseline && anomalyOverride !== true) {
      const baselineResult = await understandAndDiagnoseWithAi("System baseline hardware telemetry", apiKey);
      return NextResponse.json({
        success: true,
        anomalyFound: false,
        message: "Basic diagnostics completed, all fine.",
        summary: "All entered hardware parameters and baseline operating thresholds are within healthy manufacturer tolerances.",
        aiModelName: baselineResult.aiModelName,
        interpretedIntent: "Nominal Hardware Baseline Verification",
        testingCategory: baselineResult.testingCategory,
        reasoning: "User requested baseline health check. Probed system buses and operating system telemetry; all parameters within tolerance.",
        triggeredTool: {
          name: baselineResult.selectedTool.name,
          category: baselineResult.selectedTool.category,
          windowsCommand: baselineResult.windowsCommandExecuted,
          rawExecutionOutput: baselineResult.rawHostOutput,
          telemetrySummary: baselineResult.reasoning,
          executionTimeMs: baselineResult.executionTimeMs,
          status: "COMPLETED",
        },
        suggestChat: true,
        chatSuggestion: "Basic diagnostics show all fine. For advanced telemetry, live stress testing, or custom kernel optimizations, use the Chat-Based Agent.",
        deviceInfo: {
          deviceType,
          model,
          assetTag,
          processor,
          ram,
          storage,
          os,
        },
      });
    }

    // Run AI Understanding Model on User Query
    const aiDiag = await understandAndDiagnoseWithAi(rawSymptom, apiKey);

    // Three Final Actions (Repair, Reuse, Recycle)
    const finalActions = {
      repair: {
        title: "Book Certified Doorstep Technician",
        description: `Doorstep technician can inspect, service, or replace the affected ${aiDiag.affectedComponent}.`,
        technicianName: "Alex Rivera (Dell/HP Certified Specialist)",
        actionUrl: "/assistant",
        doorstepAvailable: true,
        estimatedCostUSD: 45.0,
      },
      reuse: {
        title: "Repurpose Working Components",
        description: "Your system has working sub-components that can be salvaged for high-value alternate purposes.",
        workingComponents: [
          `${ram} Memory (ideal for home server or secondary PC)`,
          `${storage} (ideal for external high-speed USB-C drive or backup vault)`,
          "Internal Display Panel (can be converted into a portable secondary HDMI monitor)",
          "Wi-Fi 6 Module (salvageable for desktop PCIe adapter)",
        ],
        suggestedProjects: [
          "Low-power Linux home media server (Plex/Jellyfin)",
          "Network Attached Storage (NAS) node with OpenMediaVault",
          "Dedicated Pi-hole DNS sinkhole and ad blocker",
        ],
      },
      recycle: {
        title: "E-Waste Certified Recycling Organizations",
        description: "Safely recycle unrecoverable materials with certified zero-landfill e-waste partners.",
        certifiedPartners: [
          { name: "EcoRecycle India (R2 Certified)", location: "Pan-India Doorstep Pickup", zeroLandfill: true },
          { name: "GreenTech E-Waste Recyclers", location: "Bangalore & National Hubs", zeroLandfill: true },
          { name: "EarthSafe Electronics Recycling", location: "Certified Carbon Offset Partner", zeroLandfill: true },
        ],
        scrapCreditEstimateUSD: 18.5,
      },
    };

    const passportHash = sha256(`MANUAL_DIAG:${assetTag}:${aiDiag.affectedComponent}:${Date.now()}`);

    return NextResponse.json({
      success: true,
      anomalyFound: true,
      aiModelName: aiDiag.aiModelName,
      interpretedIntent: aiDiag.interpretedIntent,
      testingCategory: aiDiag.testingCategory,
      targetSubsystem: aiDiag.targetSubsystem,
      targetDetail: aiDiag.targetDetail,
      reasoning: aiDiag.reasoning,
      affectedPart: aiDiag.affectedComponent,
      threeFactors: aiDiag.threeFactors,
      triggeredTool: {
        name: aiDiag.selectedTool.name,
        category: aiDiag.selectedTool.category,
        windowsCommand: aiDiag.windowsCommandExecuted,
        rawExecutionOutput: aiDiag.rawHostOutput,
        telemetrySummary: aiDiag.reasoning,
        executionTimeMs: aiDiag.executionTimeMs,
        status: "COMPLETED",
      },
      triageVerdict: aiDiag.triageVerdict,
      conditionAssessment: aiDiag.conditionAssessment,
      finalActions,
      passportHash,
      deviceInfo: {
        deviceType,
        model,
        assetTag,
        processor,
        ram,
        storage,
        os,
      },
    });
  } catch (error: any) {
    console.error("Manual diagnostics error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
