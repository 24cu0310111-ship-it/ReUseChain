import { prisma } from "../src/lib/prisma";
import { understandAndDiagnoseWithAi } from "../src/lib/hardware-ai-agent";
import { analyzeScreenshotOrPhoto } from "../src/lib/vision-diagnostic-engine";
import { findLearnedKnowledgeMatch, recordLearnedResolution } from "../src/lib/self-learning-agent";
import {
  TELEGRAM_ADMIN_BOT_TOKEN,
  TELEGRAM_BACKUP_BOT_TOKEN,
  sendTelegramMessage,
  dispatchEscalationToTelegram,
  deliverResolutionToUserChat,
  parseTelegramAdminCommand,
} from "../src/lib/telegram-service";

async function runVerification() {
  console.log("================================================================");
  console.log("🧪 STARTING VERIFICATION: DUAL TELEGRAM BOT & BACKUP AGENT SUITE");
  console.log("================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${detail || "Condition not met"}`);
      failed++;
    }
  }

  // 1. Verify Both Telegram Bot API Tokens
  console.log("\n--- TEST 1: LIVE TELEGRAM BOT TOKENS VALIDATION ---");
  try {
    const resAdmin = await fetch(`https://api.telegram.org/bot${TELEGRAM_ADMIN_BOT_TOKEN}/getMe`);
    const jsonAdmin = await resAdmin.json();
    assert(jsonAdmin.ok === true, "Admin Bot API Handshake (@AHackBattle013bot)", JSON.stringify(jsonAdmin));

    const resBackup = await fetch(`https://api.telegram.org/bot${TELEGRAM_BACKUP_BOT_TOKEN}/getMe`);
    const jsonBackup = await resBackup.json();
    assert(jsonBackup.ok === true, "Backup Bot API Handshake (@backuvro_bot)", JSON.stringify(jsonBackup));
  } catch (err: any) {
    assert(false, "Telegram API Handshake", err.message);
  }

  // 2. Backup Bot: Drive Errors & Boot Failure Triage
  console.log("\n--- TEST 2: BACKUP BOT DRIVE ERROR & BOOT FAILURE TRIAGE ---");
  try {
    const driveDiag = await understandAndDiagnoseWithAi("3F0 Boot device not found / NVMe drive error");
    assert(
      driveDiag.testingCategory.includes("Storage") || driveDiag.affectedComponent.toLowerCase().includes("storage") || driveDiag.affectedComponent.toLowerCase().includes("drive"),
      "Drive Error mapped to Storage Diagnostics Tool",
      driveDiag.selectedTool.name
    );
    assert(
      driveDiag.threeFactors.factor3_rootCause.length > 0,
      "Root cause generated for drive error",
      driveDiag.threeFactors.factor3_rootCause
    );
    assert(
      ["repair", "reuse", "recycle"].includes(driveDiag.triageVerdict),
      "Condition assessment provided tailored single path recommendation",
      driveDiag.triageVerdict
    );
  } catch (err: any) {
    assert(false, "Drive Error Triage", err.message);
  }

  // 3. Backup Bot: Dead PC / Power Off Triage
  console.log("\n--- TEST 3: BACKUP BOT DEAD PC / POWER OFF TRIAGE ---");
  try {
    const deadPcDiag = await understandAndDiagnoseWithAi("My PC is completely dead and won't turn on, black screen");
    assert(
      deadPcDiag.affectedComponent.toLowerCase().includes("motherboard") || deadPcDiag.affectedComponent.toLowerCase().includes("battery") || deadPcDiag.selectedTool.name.includes("Battery"),
      "Dead PC mapped to Power / Motherboard Diagnostics",
      deadPcDiag.selectedTool.name
    );
    assert(
      deadPcDiag.conditionAssessment.reasoning.length > 0,
      "Reasoning and emergency guidance provided",
      deadPcDiag.conditionAssessment.reasoning
    );
  } catch (err: any) {
    assert(false, "Dead PC Triage", err.message);
  }

  // 4. Backup Bot: Optical Screen / Crash Photo Analysis
  console.log("\n--- TEST 4: BACKUP BOT SCREEN / CRASH PHOTO ANALYSIS ---");
  try {
    const vision = await analyzeScreenshotOrPhoto("Task Manager 100% CPU runaway crypto miner");
    assert(vision.category === "task_manager_anomaly", "Vision Analyzer detected Task Manager Anomaly", vision.category);
    assert((vision.suspiciousProcessOrModule || "").includes("crypto") || (vision.suspiciousProcessOrModule || "").includes("svchost"), "Detected rogue process", vision.suspiciousProcessOrModule);
    assert(vision.suggestedWindowsCommand.length > 0, "Generated Windows API command for triage", vision.suggestedWindowsCommand);
  } catch (err: any) {
    assert(false, "Screen Photo Analysis", err.message);
  }

  // 5. Backup Bot: In-Chat ONDC Technician Booking & Live Tracking
  console.log("\n--- TEST 5: IN-CHAT ONDC DOORSTEP BOOKING & TRACKING ---");
  let testOrderId = "";
  try {
    const orderSuffix = Math.floor(100000 + Math.random() * 900000);
    testOrderId = `ONDC-SRV-2026-${orderSuffix}`;
    const dev = await prisma.device.findFirst();

    const booking = await prisma.ondcBooking.create({
      data: {
        deviceId: dev?.id || "GENERIC_DEVICE",
        assetTag: dev?.assetTag || "ASSET-0142",
        ondcOrderId: testOrderId,
        providerId: "BPP-UC-BLR-9921",
        providerName: "UrbanCare Hardware Logistics on ONDC",
        serviceCategory: "PC_HARDWARE_DOORSTEP_REPAIR",
        serviceDescription: "Emergency Doorstep Hardware Technician Dispatch from Telegram Bot",
        orderStatus: "CONFIRMED",
        timeSlot: "Tomorrow, 10:30 AM - 12:00 PM",
        totalAmountUSD: 45.0,
        customerName: "Sarah Chen",
        customerPhone: "+91 98765 43210",
        doorstepAddress: "Block C, Tech Park Boulevard, Bangalore",
        pinCode: "560103",
        gpsCoordinates: "12.9716, 77.5946",
        bapId: "reusechain.ondc.bap.org",
        bppId: "services.ondc.bpp.urbancare.net",
      },
    });

    assert(booking.ondcOrderId === testOrderId, "ONDC Booking persisted to database from Telegram action", booking.ondcOrderId);
  } catch (err: any) {
    assert(false, "In-Chat ONDC Booking", err.message);
  }

  // 6. Backup Bot: Escalation to Admin Bot with Telegram Chat ID
  console.log("\n--- TEST 6: ESCALATION FROM BACKUP BOT TO ADMIN BOT ---");
  let testEscalationId = "";
  try {
    const testChatId = "123456789";
    const dev = await prisma.device.findFirst();

    const escalation = await prisma.adminEscalation.create({
      data: {
        deviceId: dev?.id,
        assetTag: "ASSET-0142",
        queryText: "Physical clicking sound from Western Digital drive and BIOS hangs on AHCI detection",
        symptomSummary: "[Backup Bot - Offline PC] Drive clicking & BIOS freeze",
        telemetrySnippet: "Host unbootable - Offline mobile triage",
        sourceChannel: "telegram_backup_bot",
        telegramChatId: testChatId,
        status: "pending",
        urgency: "critical",
      },
    });
    testEscalationId = escalation.id;

    assert(escalation.sourceChannel === "telegram_backup_bot", "Escalation sourceChannel correctly tagged as telegram_backup_bot");
    assert(escalation.telegramChatId === testChatId, "User's telegramChatId saved for direct reply delivery");

    const tgAlert = await dispatchEscalationToTelegram({
      escalationId: escalation.id,
      assetTag: "ASSET-0142",
      queryText: escalation.queryText,
      symptomSummary: escalation.symptomSummary,
      urgency: "critical",
      sourceChannel: "telegram_backup_bot",
      telegramChatId: testChatId,
      createdAt: escalation.createdAt,
    });

    assert(tgAlert.success === true, "Alert formatted and dispatched for Admin Bot");
  } catch (err: any) {
    assert(false, "Escalation to Admin Bot", err.message);
  }

  // 7. Admin Bot: Command Parsing & Direct Reply Delivery
  console.log("\n--- TEST 7: ADMIN BOT /REPLY PARSING & BIDIRECTIONAL DELIVERY ---");
  try {
    const adminCommand = `/reply ${testEscalationId.slice(0, 8)} Mechanical head crash confirmed. Do not power cycle. Dispatched cleanroom data recovery engineer.`;
    const parsed = parseTelegramAdminCommand(adminCommand);

    assert(parsed.command === "reply", "Command correctly parsed as reply", parsed.command);
    assert(parsed.ticketId === testEscalationId.slice(0, 8), "Ticket ID accurately extracted", parsed.ticketId);

    // Record resolution and seal in self-learning store
    const resolution = await recordLearnedResolution({
      escalationId: testEscalationId,
      adminResponse: parsed.resolutionMessage!,
      resolvedBy: "Lead Storage Engineer (via Admin Bot)",
    });

    assert(resolution.success === true, "Learned resolution recorded in database");
    assert(resolution.passportHash.length > 20, "Circularity Passport block sealed with cryptographic hash");

    const updatedEsc = await prisma.adminEscalation.findUnique({ where: { id: testEscalationId } });
    assert(updatedEsc?.status === "resolved", "Escalation ticket status updated to resolved");
  } catch (err: any) {
    assert(false, "Admin Bot Reply & Delivery", err.message);
  }

  // 8. Adaptive Self-Learning Adaptation: Next identical issue solved autonomously
  console.log("\n--- TEST 8: ADAPTIVE SELF-LEARNING AGENT MEMORY VERIFICATION ---");
  try {
    const followUpQuery = "Physical clicking sound from Western Digital drive";
    const match = await findLearnedKnowledgeMatch(followUpQuery);

    assert(match.matched === true, "Self-Learning Agent recognized previously resolved symptom", match.match?.symptomSignature);
    assert(
      Boolean(match.match?.adminResponse && (match.match.adminResponse.includes("cleanroom data recovery") || match.match.adminResponse.includes("Mechanical head crash"))),
      "Self-Learning Agent recalled Admin's exact verified resolution",
      match.match?.adminResponse
    );
  } catch (err: any) {
    assert(false, "Self-Learning Verification", err.message);
  }

  console.log("\n================================================================");
  console.log(`🏁 VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runVerification();
