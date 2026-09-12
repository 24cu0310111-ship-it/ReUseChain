export {};

import { analyzeScreenshotOrPhoto } from "../src/lib/vision-diagnostic-engine";
import { dispatchEscalationToTelegram, parseTelegramAdminCommand } from "../src/lib/telegram-service";
import { recordLearnedResolution, findLearnedKnowledgeMatch } from "../src/lib/self-learning-agent";
import { prisma } from "../src/lib/prisma";

async function runVerification() {
  console.log("================================================================================");
  console.log("🚀 STARTING COMPREHENSIVE VERIFICATION: VISION, TELEGRAM & SELF-LEARNING AGENT");
  console.log("================================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (detail) console.log(`   └─ ${detail}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error(`   └─ ${detail}`);
    }
  }

  // ---------------------------------------------------------------------------
  // TEST 1: VISION & TASK MANAGER RUNAWAY CPU DETECTION
  // ---------------------------------------------------------------------------
  console.log("--- TEST SUITE 1: Vision Diagnostic & Task Manager Detection ---");
  const cpuVision = await analyzeScreenshotOrPhoto(
    "cpu_runaway",
    "Task Manager shows svchost_crypto.exe consuming 98.4% CPU and clocks throttled"
  );

  assert(
    cpuVision.category === "task_manager_anomaly",
    "Vision identifies Task Manager anomaly category",
    `Category: ${cpuVision.category}`
  );
  assert(
    cpuVision.suspiciousProcessOrModule?.includes("svchost_crypto") || false,
    "Vision flags suspicious rogue process name",
    `Process: ${cpuVision.suspiciousProcessOrModule}`
  );
  assert(
    cpuVision.selectedTool.id === "cpu_direct",
    "Vision triggers CPU direct telemetry diagnostic tool",
    `Tool: ${cpuVision.selectedTool.name}`
  );
  assert(
    cpuVision.triageVerdict === "repair",
    "Vision provides condition-based verdict: repair only",
    `Verdict: ${cpuVision.triageVerdict} | Badge: ${cpuVision.conditionAssessment.badge}`
  );

  // ---------------------------------------------------------------------------
  // TEST 2: VISION & TASK MANAGER MEMORY LEAK DETECTION
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST SUITE 2: Memory Leak Task Manager Detection ---");
  const ramVision = await analyzeScreenshotOrPhoto(
    "memory_leak",
    "Task Manager shows 95% RAM utilization and non-paged kernel pool ballooning"
  );

  assert(
    ramVision.anomalySubsystem === "ram",
    "Vision maps memory leak to RAM subsystem",
    `Subsystem: ${ramVision.anomalySubsystem}`
  );
  assert(
    ramVision.selectedTool.id === "ram_functional",
    "Vision triggers RAM functional memory stress test",
    `Command: ${ramVision.suggestedWindowsCommand}`
  );

  // ---------------------------------------------------------------------------
  // TEST 3: VISION & BSOD STOP CODE PARSING
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST SUITE 3: Optical BSOD Screen Crash Parsing ---");
  const bsodVision = await analyzeScreenshotOrPhoto(
    "bsod_irql",
    "Screen photo with stop code DRIVER_IRQL_NOT_LESS_OR_EQUAL rtwlane601.sys"
  );

  assert(
    bsodVision.category === "kernel_crash_bsod",
    "Vision identifies Blue Screen of Death kernel crash category",
    `Category: ${bsodVision.category}`
  );
  assert(
    bsodVision.suspiciousProcessOrModule?.includes("rtwlane601.sys") || false,
    "Vision isolates faulty network adapter driver",
    `Failing Driver: ${bsodVision.suspiciousProcessOrModule}`
  );

  // ---------------------------------------------------------------------------
  // TEST 4: TELEGRAM ADMIN COMMAND PARSER
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST SUITE 4: Telegram Admin Command Parsing ---");
  const sampleCommand = "/reply ESC-7721 Disable PCIe ASPM in UEFI and reset network stack";
  const parsedCmd = parseTelegramAdminCommand(sampleCommand);

  assert(
    parsedCmd.command === "reply",
    "Telegram parser identifies /reply command",
    `Command: ${parsedCmd.command}`
  );
  assert(
    parsedCmd.ticketId === "ESC-7721",
    "Telegram parser extracts target escalation ticket ID",
    `Ticket: ${parsedCmd.ticketId}`
  );
  assert(
    parsedCmd.resolutionMessage?.includes("Disable PCIe ASPM") || false,
    "Telegram parser extracts resolution message",
    `Message: "${parsedCmd.resolutionMessage}"`
  );

  // ---------------------------------------------------------------------------
  // TEST 5: ADMIN ESCALATION TICKET & TELEGRAM DISPATCH
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST SUITE 5: Admin Escalation & Telegram Alert Dispatch ---");
  const dev = await prisma.device.findFirst();
  const testEscalation = await prisma.adminEscalation.create({
    data: {
      deviceId: dev?.id || "GENERIC_DEVICE",
      assetTag: dev?.assetTag || "ASSET-0142",
      queryText: "Unfamiliar kernel BugCheck 0x800F0922 occurring during Windows servicing",
      symptomSummary: "Kernel halt 0x800F0922 during CBS stack update",
      telemetrySnippet: "WMI Status OK, Intel i3-1305U, 24GB RAM",
      mediaUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      sourceChannel: "web_chat",
      status: "pending",
      urgency: "high",
    },
  });

  assert(
    Boolean(testEscalation.id),
    "AdminEscalation ticket persisted to database with status 'pending'",
    `Ticket ID: ${testEscalation.id} | Status: ${testEscalation.status}`
  );

  const tgResult = await dispatchEscalationToTelegram({
    escalationId: testEscalation.id,
    assetTag: testEscalation.assetTag || "ASSET-0142",
    queryText: testEscalation.queryText,
    symptomSummary: testEscalation.symptomSummary,
    telemetrySnippet: testEscalation.telemetrySnippet || undefined,
    urgency: "high",
    mediaUrl: testEscalation.mediaUrl || undefined,
    createdAt: testEscalation.createdAt,
  });

  assert(
    tgResult.success,
    "Escalation successfully dispatched to Telegram Gateway",
    `Mode: ${tgResult.mode} | Message ID: ${tgResult.messageId}`
  );

  // ---------------------------------------------------------------------------
  // TEST 6: ADMIN REPLIES VIA TELEGRAM & RESOLUTION COMMITTED
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST SUITE 6: Admin Telegram Reply & Knowledge Sealing ---");
  const adminTelegramResolution = "CBS stack error 0x800F0922 is caused by corrupted servicing packages. Execute DISM /Online /Cleanup-Image /RestoreHealth and reset SoftwareDistribution directory.";

  const recordResult = await recordLearnedResolution({
    escalationId: testEscalation.id,
    adminResponse: adminTelegramResolution,
    learnedRule: "For CBS servicing error 0x800F0922, run DISM Component Store RestoreHealth and flush SoftwareDistribution cache.",
    resolvedBy: "Lead Systems Administrator (via Telegram Bot)",
  });

  assert(
    recordResult.success,
    "Admin resolution recorded and marked as resolved",
    `Learned Rule: "${recordResult.learnedItem.learnedRule}"`
  );
  assert(
    Boolean(recordResult.passportHash) && recordResult.passportHash.length === 64,
    "Circularity Passport cryptographic hash generated and sealed",
    `Passport Hash: ${recordResult.passportHash.slice(0, 24)}...`
  );

  // Verify status in DB
  const updatedEsc = await prisma.adminEscalation.findUnique({ where: { id: testEscalation.id } });
  assert(
    updatedEsc?.status === "resolved",
    "Database escalation status transitions to 'resolved'",
    `Status: ${updatedEsc?.status} | Resolved By: ${updatedEsc?.resolvedBy}`
  );

  // ---------------------------------------------------------------------------
  // TEST 7: SELF-IMPROVING ADAPTATION (FUTURE IDENTICAL SITUATION)
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST SUITE 7: Self-Improving AI Adaptation on Future Query ---");
  // A second user comes with the exact same error code / symptom
  const subsequentQuery = "I have an error 0x800F0922 when updating Windows, what do I do?";
  const learnedMatch = await findLearnedKnowledgeMatch(subsequentQuery);

  assert(
    learnedMatch.matched === true,
    "Agent autonomously detects previously learned admin resolution for 0x800F0922",
    `Similarity Score: ${learnedMatch.similarityScore} | Matched Rule: ${learnedMatch.match?.learnedRule}`
  );
  assert(
    learnedMatch.match?.adminResponse === adminTelegramResolution,
    "Agent retrieves exact verified solution provided by the Admin via Telegram",
    `Admin Guidance: "${learnedMatch.match?.adminResponse.slice(0, 80)}..."`
  );
  assert(
    (learnedMatch.match?.timesApplied || 0) >= 1,
    "Agent increments timesApplied metric demonstrating continuous active learning",
    `Times Applied: ${learnedMatch.match?.timesApplied}`
  );

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`🏁 VERIFICATION SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("================================================================================");

  if (passedTests === totalTests) {
    console.log("🎉 ALL INTEGRATION TESTS PASSED! Vision OCR, Telegram Bot Escalation, and Adaptive Self-Learning are operating flawlessly.");
  } else {
    console.error(`⚠️ ${totalTests - passedTests} test(s) failed. Review the output above.`);
    process.exit(1);
  }
}

runVerification()
  .catch((err) => {
    console.error("Verification execution crashed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
