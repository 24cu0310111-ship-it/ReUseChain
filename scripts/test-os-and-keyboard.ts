async function testOsAndKeyboard() {
  console.log("=== RUNNING OS TROUBLE & KEYBOARD PHYSICAL COMPONENT TESTS ===");

  // 1. Test GET /api/telegram
  console.log("\n--- 1. Testing GET /api/telegram (Webhook Status) ---");
  const tgGet = await fetch("http://localhost:3000/api/telegram").then((r) => r.json());
  console.log("Telegram Service Status:", tgGet.status);
  console.log("Supported Signatures:", tgGet.supportedErrorSignatures);

  // 2. Test POST /api/telegram: Screen Photo BSOD (Driver Crash -> Software Agent)
  console.log("\n--- 2. Testing Screen Photo BSOD: DRIVER_IRQL_NOT_LESS_OR_EQUAL ---");
  const tgRes1 = await fetch("http://localhost:3000/api/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Screen photo captured after blue screen crash",
      photoType: "driver_irql",
      assetTag: "ASSET-0142",
    }),
  }).then((r) => r.json());

  console.log("Detected Error:", tgRes1.analysis?.detectedErrorCode);
  console.log("Crash Category:", tgRes1.analysis?.crashCategory);
  console.log("Handoff Target:", tgRes1.analysis?.recommendedAgent);
  console.log("Suggested Commands:", tgRes1.analysis?.remediationCommands);

  // 3. Test POST /api/telegram: Hardware Storage Failure (UNMOUNTABLE_BOOT_VOLUME -> Hardware Execution Agent)
  console.log("\n--- 3. Testing Screen Photo BSOD: UNMOUNTABLE_BOOT_VOLUME (Hardware Handoff) ---");
  const tgRes2 = await fetch("http://localhost:3000/api/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Screen photo shows BSOD UNMOUNTABLE_BOOT_VOLUME, cannot boot into Windows",
      photoType: "unmountable_boot_volume",
      assetTag: "ASSET-0142",
    }),
  }).then((r) => r.json());

  console.log("Detected Error:", tgRes2.analysis?.detectedErrorCode);
  console.log("Handoff Target:", tgRes2.analysis?.recommendedAgent);
  console.log("Action Type:", tgRes2.executionResult?.actionType);
  console.log("Work Order Service:", tgRes2.executionResult?.serviceType);
  console.log("Assigned Technician:", tgRes2.executionResult?.technician);
  console.log("Passport Hash:", tgRes2.executionResult?.passportHash?.slice(0, 16));

  // 4. Test POST /api/telegram: Abnormal OS Freezing Query (Natural Language)
  console.log("\n--- 4. Testing User Telling AI About Abnormal OS Behavior ---");
  const tgRes3 = await fetch("http://localhost:3000/api/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "My Windows explorer randomly freezes and cursor keeps spinning with 100% disk spike",
      assetTag: "ASSET-0142",
    }),
  }).then((r) => r.json());

  console.log("Detected Error:", tgRes3.analysis?.detectedErrorCode);
  console.log("Remediation Solutions:", tgRes3.analysis?.suggestedSolution);
  console.log("Handoff Target:", tgRes3.analysis?.recommendedAgent);

  // 5. Test POST /api/diagnostics/keyboard: Physical Component Trouble Catching & Execution Agent Handoff
  console.log("\n--- 5. Testing Physical Component Trouble Catching: Keyboard Matrix Test ---");
  const kbRes = await fetch("http://localhost:3000/api/diagnostics/keyboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      assetTag: "ASSET-0142",
      deadKeys: ["W", "E", "Spacebar"],
      totalKeysTested: 6,
      symptomReported: "Keyboard buttons aren't working on the device",
      keyChatterDetected: true,
    }),
  }).then((r) => r.json());

  console.log("Diagnostic Success:", kbRes.success);
  console.log("Failure Classification:", kbRes.diagnosticResult?.failureClassification);
  console.log("Dead Keys Detected:", kbRes.diagnosticResult?.deadKeys);
  console.log("Severity:", kbRes.diagnosticResult?.severity);
  console.log("Execution Agent Dispatched:", kbRes.executionHandoff?.agent);
  console.log("Service Dispatched:", kbRes.executionHandoff?.serviceType);
  console.log("Technician:", kbRes.executionHandoff?.technician);
  console.log("Cost ($):", kbRes.executionHandoff?.estimatedCostUSD);
  console.log("Passport Hash:", kbRes.executionHandoff?.passportHash?.slice(0, 16));

  console.log("\n=== ALL OS TROUBLE & KEYBOARD PHYSICAL TESTS COMPLETED! ===");
}

testOsAndKeyboard().catch(console.error);
