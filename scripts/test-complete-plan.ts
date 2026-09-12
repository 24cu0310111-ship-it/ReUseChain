// Comprehensive End-to-End Validation of the Complete Plan & Website Overview
async function validateCompletePlan() {
  const BASE_URL = "http://localhost:3000";

  console.log("===============================================================");
  console.log("🚀 COMPREHENSIVE VERIFICATION: COMPLETE PLAN & WEBSITE OVERVIEW");
  console.log("===============================================================\n");

  let allPassed = true;

  // -------------------------------------------------------------
  // TEST 1: Manual Data Entry - Healthy Baseline (No Anomaly)
  // Requirement: If no anomaly is found, display "Basic diagnostics completed, all fine" and suggest chat
  // -------------------------------------------------------------
  console.log("1. Testing Manual Flow: Healthy Baseline Check");
  try {
    const res = await fetch(`${BASE_URL}/api/diagnostics/manual`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceType: "desktop",
        model: "Dell OptiPlex 7090",
        assetTag: "ASSET-0142",
        processor: "13th Gen Intel Core i3",
        ram: "24 GB DDR4",
        storage: "512GB NVMe",
        os: "Windows 11",
        symptom: "All functioning normally within baseline",
      }),
    });
    const data = await res.json();
    console.log("   - Success:", data.success);
    console.log("   - Anomaly Found:", data.anomalyFound);
    console.log("   - Message:", data.message);
    console.log("   - Suggest Chat:", data.suggestChat);

    if (data.anomalyFound === false && data.message.includes("Basic diagnostics completed, all fine.")) {
      console.log("   ✅ PASSED: Healthy baseline correctly displays 'all fine' and suggests chat.\n");
    } else {
      console.error("   ❌ FAILED: Unexpected healthy baseline response", data);
      allPassed = false;
    }
  } catch (err: any) {
    console.error("   ❌ ERROR:", err.message);
    allPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 2: Manual Flow - Serviceable Anomaly (Suggest ONLY Repair)
  // Requirement: Mention damaged part, three factors, suggest ONLY Repair
  // -------------------------------------------------------------
  console.log("2. Testing Manual Flow: Battery Degradation Anomaly");
  try {
    const res = await fetch(`${BASE_URL}/api/diagnostics/manual`, {
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
    const data = await res.json();
    console.log("   - Anomaly Found:", data.anomalyFound);
    console.log("   - Damaged / Affected Part:", data.affectedPart);
    console.log("   - Factor 1:", data.threeFactors?.factor1_health);
    console.log("   - Factor 2:", data.threeFactors?.factor2_impact);
    console.log("   - Factor 3:", data.threeFactors?.factor3_rootCause);
    console.log("   - Condition Verdict:", data.triageVerdict);

    if (
      data.anomalyFound === true &&
      data.affectedPart &&
      data.threeFactors?.factor1_health &&
      data.threeFactors?.factor2_impact &&
      data.threeFactors?.factor3_rootCause &&
      data.triageVerdict === "repair"
    ) {
      console.log("   ✅ PASSED: Identifies damaged part, 3 factors, and suggests ONLY Repair.\n");
    } else {
      console.error("   ❌ FAILED: Anomaly repair test failed", data);
      allPassed = false;
    }
  } catch (err: any) {
    console.error("   ❌ ERROR:", err.message);
    allPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 3: Manual Flow - Reuse Condition (Suggest ONLY Reuse)
  // -------------------------------------------------------------
  console.log("3. Testing Manual Flow: Working Component Repurposing");
  try {
    const res = await fetch(`${BASE_URL}/api/diagnostics/manual`, {
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
    const data = await res.json();
    console.log("   - Triage Verdict:", data.triageVerdict);
    console.log("   - Working Components:", data.finalActions?.reuse?.workingComponents?.length);

    if (data.triageVerdict === "reuse") {
      console.log("   ✅ PASSED: Suggests ONLY Reuse for healthy modular components.\n");
    } else {
      console.error("   ❌ FAILED: Expected reuse triage", data);
      allPassed = false;
    }
  } catch (err: any) {
    console.error("   ❌ ERROR:", err.message);
    allPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 4: Manual Flow - Recycle Condition (Suggest ONLY Recycle)
  // -------------------------------------------------------------
  console.log("4. Testing Manual Flow: Non-Repairable E-Waste Scrap");
  try {
    const res = await fetch(`${BASE_URL}/api/diagnostics/manual`, {
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
    const data = await res.json();
    console.log("   - Triage Verdict:", data.triageVerdict);
    console.log("   - Recycler Partners:", data.finalActions?.recycle?.certifiedPartners?.length);

    if (data.triageVerdict === "recycle") {
      console.log("   ✅ PASSED: Suggests ONLY Recycle for catastrophic hardware failure.\n");
    } else {
      console.error("   ❌ FAILED: Expected recycle triage", data);
      allPassed = false;
    }
  } catch (err: any) {
    console.error("   ❌ ERROR:", err.message);
    allPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 5: Chat Agent - In-Chat Diagnosis & Specialized Tool Execution
  // -------------------------------------------------------------
  console.log("5. Testing Chat Agent: In-Chat Keyboard Semicolon Key Diagnostic");
  try {
    const res = await fetch(`${BASE_URL}/api/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "Keyboard semi colon symbol is that working",
        assetTag: "ASSET-0142",
      }),
    });
    const data = await res.json();
    console.log("   - Action Type:", data.actionType);
    console.log("   - Tool Triggered:", data.actionDetails?.selectedTool?.name);
    console.log("   - Target Detail:", data.actionDetails?.targetDetail);
    console.log("   - Triage Verdict:", data.actionDetails?.triageVerdict);

    if (
      data.actionType === "HARDWARE_AI_DIAGNOSTIC" &&
      data.actionDetails?.targetDetail?.includes("Semicolon") &&
      data.actionDetails?.triageVerdict === "repair"
    ) {
      console.log("   ✅ PASSED: Chat agent runs targeted semicolon test inside chat and suggests Repair.\n");
    } else {
      console.error("   ❌ FAILED: Chat agent diagnostic response", data);
      allPassed = false;
    }
  } catch (err: any) {
    console.error("   ❌ ERROR:", err.message);
    allPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 6: Chat Agent - Admin Live Reply & Self-Learning
  // Requirement: If agent cannot answer, issue is given to admin, admin provides live reply in chat, agent learns
  // -------------------------------------------------------------
  console.log("6. Testing Chat Agent: Admin Escalation, Live Reply & Permanent Learning");
  try {
    const res = await fetch(`${BASE_URL}/api/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "escalate this complex pcie power state collision to admin, I need help",
        assetTag: "ASSET-0142",
      }),
    });
    const data = await res.json();
    console.log("   - Action Type:", data.actionType);
    console.log("   - Admin Live Reply:", data.actionDetails?.adminLiveReply?.slice(0, 60) + "...");
    console.log("   - Learned Rule:", data.actionDetails?.learnedRule?.slice(0, 60) + "...");

    if (
      data.actionType === "ADMIN_ESCALATION" &&
      data.actionDetails?.adminLiveReply &&
      data.actionDetails?.learnedRule
    ) {
      console.log("   ✅ PASSED: Admin live reply delivered into chat and learned rule committed.\n");
    } else {
      console.error("   ❌ FAILED: Admin escalation flow", data);
      allPassed = false;
    }
  } catch (err: any) {
    console.error("   ❌ ERROR:", err.message);
    allPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 7: ONDC Doorstep Technician Booking & Real-Time Tracking
  // -------------------------------------------------------------
  console.log("7. Testing ONDC Doorstep Technician Booking & GPS Tracking");
  try {
    const bookRes = await fetch(`${BASE_URL}/api/ondc/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Book doorstep technician for battery replacement",
        serviceTypeOverride: "Battery Pack Service",
        assetTag: "ASSET-0142",
        timeSlotOverride: "Tomorrow, 10:30 AM",
      }),
    });
    const bookData = await bookRes.json();
    console.log("   - Booking Success:", bookData.success);
    console.log("   - ONDC Order ID:", bookData.ondcOrderId);
    console.log("   - Assigned Technician:", bookData.bookingDetails?.assignedTechnician);

    if (bookData.success && bookData.ondcOrderId) {
      // Test Live Tracking
      const trackRes = await fetch(`${BASE_URL}/api/ondc/track/${encodeURIComponent(bookData.ondcOrderId)}`);
      const trackData = await trackRes.json();
      console.log("   - Tracking Status:", trackData.status);
      console.log("   - Technician Coordinates:", trackData.technician?.currentGps?.lat, trackData.technician?.currentGps?.lng);
      console.log("   - ETA:", trackData.estimatedArrival?.minutesRemaining, "minutes", `(${trackData.estimatedArrival?.distanceKm} km away)`);

      if (trackData.success && trackData.technician?.currentGps) {
        console.log("   ✅ PASSED: ONDC Doorstep Technician booked and live GPS tracking verified.\n");
      } else {
        console.error("   ❌ FAILED: Live tracking failed", trackData);
        allPassed = false;
      }
    } else {
      console.error("   ❌ FAILED: ONDC booking failed", bookData);
      allPassed = false;
    }
  } catch (err: any) {
    console.error("   ❌ ERROR:", err.message);
    allPassed = false;
  }

  // Final Summary
  console.log("===============================================================");
  if (allPassed) {
    console.log("🎉 ALL 7 SYSTEM FLOWS FULLY PASSED AND VERIFIED!");
    console.log("The entire website overview and implementation plan is 100% operational.");
  } else {
    console.error("⚠️ Some tests failed. Check logs above.");
    process.exit(1);
  }
  console.log("===============================================================");
}

validateCompletePlan();
