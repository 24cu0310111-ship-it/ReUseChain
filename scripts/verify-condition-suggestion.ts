// Automated Verification for Condition-Based Single Option Suggestions
async function runVerification() {
  const BASE_URL = "http://localhost:3000";

  console.log("=== Testing Condition-Based Single Option Suggestions ===\n");

  // Test 1: Battery Drain Anomaly (Matching User Screenshot)
  console.log("1. Testing Battery Drain Anomaly (Serviceable Degradation):");
  const batteryRes = await fetch(`${BASE_URL}/api/diagnostics/manual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deviceType: "laptop",
      model: "Lenovo ThinkPad T14s",
      assetTag: "ASSET-0142",
      processor: "13th Gen Intel Core i3",
      ram: "24 GB DDR4",
      storage: "512GB NVMe",
      os: "Windows 11",
      symptom: "Battery draining from 100% to 0% in 40 minutes",
    }),
  });
  const batteryData = await batteryRes.json();
  console.log("   - Interpreted Intent:", batteryData.interpretedIntent);
  console.log("   - Triggered Tool:", batteryData.triggeredTool?.name);
  console.log("   - Affected Part:", batteryData.affectedPart);
  console.log("   - Triage Verdict:", batteryData.triageVerdict);
  console.log("   - Condition Badge:", batteryData.conditionAssessment?.badge);
  if (batteryData.triageVerdict === "repair") {
    console.log("   ✅ PASSED: Battery Degradation correctly evaluated to REPAIR ONLY.\n");
  } else {
    throw new Error(`Expected triageVerdict 'repair' but got '${batteryData.triageVerdict}'`);
  }

  // Test 2: Keyboard Semicolon Key Failure
  console.log("2. Testing Keyboard Semicolon Key Failure (Serviceable Anomaly):");
  const keyboardRes = await fetch(`${BASE_URL}/api/diagnostics/manual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deviceType: "laptop",
      model: "HP EliteBook 840",
      assetTag: "ASSET-0142",
      processor: "13th Gen Intel Core i3",
      ram: "24 GB DDR4",
      storage: "512GB NVMe",
      os: "Windows 11",
      symptom: "Keyboard semi colon symbol is that working",
    }),
  });
  const keyboardData = await keyboardRes.json();
  console.log("   - Interpreted Intent:", keyboardData.interpretedIntent);
  console.log("   - Triage Verdict:", keyboardData.triageVerdict);
  console.log("   - Condition Badge:", keyboardData.conditionAssessment?.badge);
  if (keyboardData.triageVerdict === "repair") {
    console.log("   ✅ PASSED: Keyboard Semicolon Key correctly evaluated to REPAIR ONLY.\n");
  } else {
    throw new Error(`Expected triageVerdict 'repair' but got '${keyboardData.triageVerdict}'`);
  }

  // Test 3: Component Reuse / Repurposing
  console.log("3. Testing Component Reuse / Repurposing (Healthy Working Modules):");
  const reuseRes = await fetch(`${BASE_URL}/api/diagnostics/manual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deviceType: "laptop",
      model: "Dell Latitude 5430",
      assetTag: "ASSET-0142",
      processor: "13th Gen Intel Core i3",
      ram: "24 GB DDR4",
      storage: "512GB NVMe",
      os: "Windows 11",
      symptom: "Decommissioned laptop, want to reuse working RAM and SSD for home server",
    }),
  });
  const reuseData = await reuseRes.json();
  console.log("   - Interpreted Intent:", reuseData.interpretedIntent);
  console.log("   - Triage Verdict:", reuseData.triageVerdict);
  console.log("   - Condition Badge:", reuseData.conditionAssessment?.badge);
  if (reuseData.triageVerdict === "reuse") {
    console.log("   ✅ PASSED: Working Components correctly evaluated to REUSE ONLY.\n");
  } else {
    throw new Error(`Expected triageVerdict 'reuse' but got '${reuseData.triageVerdict}'`);
  }

  // Test 4: Catastrophic Damage / End-of-Life Scrap (Recycle)
  console.log("4. Testing E-Waste Recycling (Non-Repairable Failure):");
  const recycleRes = await fetch(`${BASE_URL}/api/diagnostics/manual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deviceType: "laptop",
      model: "Legacy Dell Studio 1555",
      assetTag: "ASSET-0142",
      processor: "Core 2 Duo",
      ram: "4 GB",
      storage: "250GB HDD",
      os: "Windows Vista",
      symptom: "Dead laptop with fried motherboard and burnt liquid damage beyond repair",
    }),
  });
  const recycleData = await recycleRes.json();
  console.log("   - Interpreted Intent:", recycleData.interpretedIntent);
  console.log("   - Triage Verdict:", recycleData.triageVerdict);
  console.log("   - Condition Badge:", recycleData.conditionAssessment?.badge);
  if (recycleData.triageVerdict === "recycle") {
    console.log("   ✅ PASSED: Catastrophic Hardware correctly evaluated to RECYCLE ONLY.\n");
  } else {
    throw new Error(`Expected triageVerdict 'recycle' but got '${recycleData.triageVerdict}'`);
  }

  // Test 5: Chat Assistant Route Verdict Pass-Through
  console.log("5. Testing Chat Assistant Route (/api/assistant):");
  const chatRes = await fetch(`${BASE_URL}/api/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: "My battery is dying in 30 minutes, can you diagnose it?",
      assetTag: "ASSET-0142",
    }),
  });
  const chatData = await chatRes.json();
  console.log("   - Action Type:", chatData.actionType);
  console.log("   - Triage Verdict:", chatData.actionDetails?.triageVerdict);
  if (chatData.actionDetails?.triageVerdict === "repair") {
    console.log("   ✅ PASSED: Assistant API returns REPAIR ONLY condition verdict.\n");
  } else {
    throw new Error(`Expected assistant triageVerdict 'repair' but got '${chatData.actionDetails?.triageVerdict}'`);
  }

  console.log("🎉 ALL TESTS PASSED: The detection agent strictly and accurately suggests ONLY the necessary option corresponding to device condition!");
}

runVerification().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
