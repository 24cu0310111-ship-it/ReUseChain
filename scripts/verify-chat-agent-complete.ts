async function testQuery(title: string, query: string, expectedAction: string) {
  console.log(`\n======================================================`);
  console.log(`TEST: ${title}`);
  console.log(`Prompt: "${query}"`);
  
  const res = await fetch("http://localhost:3000/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ queryText: query, assetTag: "ASSET-0142" }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  console.log(`SUCCESS: ${data.success}`);
  console.log(`Returned actionType: ${data.actionType} (Expected: ${expectedAction})`);
  
  if (data.actionType !== expectedAction) {
    throw new Error(`Action type mismatch: got ${data.actionType}, expected ${expectedAction}`);
  }

  return data;
}

async function run() {
  console.log("=== STARTING COMPLETE CHAT AGENT VALIDATION ===");

  // 1. Tool Triggering & Understanding Model (Keyboard)
  const diagRes = await testQuery(
    "1. Cognitive AI Tool Triggering & Diagnostic Understanding",
    "Keyboard semi colon symbol is that working",
    "HARDWARE_AI_DIAGNOSTIC"
  );
  console.log("-> Tool:", diagRes.actionDetails?.selectedTool?.name);
  console.log("-> Category:", diagRes.actionDetails?.testingCategory);
  console.log("-> Verdict:", diagRes.actionDetails?.triageVerdict);
  console.log("-> Factor 1:", diagRes.actionDetails?.threeFactors?.factor1_health);
  console.log("-> Factor 2:", diagRes.actionDetails?.threeFactors?.factor2_impact);
  console.log("-> Factor 3:", diagRes.actionDetails?.threeFactors?.factor3_rootCause);
  console.log("-> Windows CMD:", diagRes.actionDetails?.windowsCommandExecuted);

  // 2. Doorstep Booking Execution In-Chat
  const bookRes = await testQuery(
    "2. In-Chat Doorstep Technician Booking via ONDC",
    "Book a doorstep technician for tomorrow 10am",
    "DOORSTEP_BOOKING"
  );
  console.log("-> Order ID:", bookRes.actionDetails?.orderId);
  console.log("-> Technician:", bookRes.actionDetails?.technician);
  console.log("-> Pre-authorized Fee: $" + bookRes.actionDetails?.serviceFeeUSD);
  console.log("-> Embedded Live Tracking ETA:", bookRes.actionDetails?.trackingDetails?.etaMinutes + " mins");
  console.log("-> Embedded Milestones:", bookRes.actionDetails?.trackingDetails?.milestones?.length);

  // 3. Live ONDC GPS Radar Execution In-Chat
  const trackRes = await testQuery(
    "3. In-Chat Live ONDC GPS Telemetry Tracking",
    "Track my technician live on ONDC",
    "TRACKING_ACTION"
  );
  console.log("-> Status:", trackRes.actionDetails?.status);
  console.log("-> Vehicle:", trackRes.actionDetails?.vehicle);
  console.log("-> ETA:", trackRes.actionDetails?.etaMinutes + " mins");
  console.log("-> Coordinates:", trackRes.actionDetails?.currentCoordinates);

  // 4. Modular Reuse & Repurpose Execution In-Chat
  const reuseRes = await testQuery(
    "4. In-Chat Modular Component Salvage & Reuse Blueprints",
    "Repurpose working components for home server or NAS node",
    "REUSE_ACTION"
  );
  console.log("-> Carbon Savings:", reuseRes.actionDetails?.carbonSavingsKgCO2e + " kg CO2e");
  console.log("-> Salvaged Parts:", reuseRes.actionDetails?.salvagedComponents?.map((c: any) => c.name).join("; "));
  console.log("-> Blueprints Generated:", reuseRes.actionDetails?.blueprints?.map((b: any) => b.title).join("; "));

  // 5. Zero-Landfill E-Waste Recycling Execution In-Chat
  const recycleRes = await testQuery(
    "5. In-Chat Certified Zero-Landfill E-Waste Disposal",
    "Schedule certified zero-landfill e-waste pickup with scrap credit",
    "RECYCLE_ACTION"
  );
  console.log("-> Pickup ID:", recycleRes.actionDetails?.pickupId);
  console.log("-> Certified Partner:", recycleRes.actionDetails?.partnerName);
  console.log("-> Scrap Credit: $" + recycleRes.actionDetails?.scrapCreditAmountUSD);
  console.log("-> Destruction Cert:", recycleRes.actionDetails?.destructionCertificateNumber);

  // 6. Admin Escalation & Autonomous Learning In-Chat
  const adminRes = await testQuery(
    "6. In-Chat Lead Systems Admin Escalation & Learning",
    "I have an unfamiliar kernel error 0x800F0922, please escalate to admin",
    "ADMIN_ESCALATION"
  );
  console.log("-> Admin Live Reply:", adminRes.actionDetails?.adminLiveReply);
  console.log("-> Learned Rule:", adminRes.actionDetails?.learnedRule);

  console.log("\n======================================================");
  console.log("🎉 ALL 6 CHAT-BASED AGENT ACTION FLOWS VERIFIED 100%!");
  console.log("======================================================");
}

run().catch((err) => {
  console.error("Validation failed:", err);
  process.exit(1);
});
