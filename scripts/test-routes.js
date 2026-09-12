async function check() {
  const routes = [
    "/",
    "/assistant",
    "/fleet",
    "/desktop-agent",
    "/settings",
    "/escalations",
    "/passport",
    "/intake",
    "/simulator",
    "/approvals",
    "/learning"
  ];
  console.log("Checking UI Pages...");
  for (const r of routes) {
    try {
      const res = await fetch("http://localhost:3000" + r);
      console.log(`Page: ${r} -> HTTP ${res.status}`);
    } catch (e) {
      console.error(`Page: ${r} -> ERROR: ${e.message}`);
    }
  }

  console.log("\nTesting Manual Diagnostics Endpoint (No Anomaly)...");
  const resManualHealthy = await fetch("http://localhost:3000/api/diagnostics/manual", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptom: "none" })
  });
  const dataManualHealthy = await resManualHealthy.json();
  console.log(`Manual Healthy Result: anomalyFound=${dataManualHealthy.anomalyFound}, msg="${dataManualHealthy.message}"`);

  console.log("\nTesting Manual Diagnostics Endpoint (Anomaly with 3 Factors & Actions)...");
  const resManualAnomaly = await fetch("http://localhost:3000/api/diagnostics/manual", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptom: "Severe CPU overheating and fan noise" })
  });
  const dataManualAnomaly = await resManualAnomaly.json();
  console.log(`Manual Anomaly Result: anomalyFound=${dataManualAnomaly.anomalyFound}`);
  console.log(`Damaged/Affected Part: ${dataManualAnomaly.affectedPart}`);
  console.log(`Three Factors:`, dataManualAnomaly.threeFactors);
  console.log(`Final Actions Available:`, Object.keys(dataManualAnomaly.finalActions));

  console.log("\nTesting Chat Assistant Admin Escalation & Learning Loop...");
  const resChatEscalation = await fetch("http://localhost:3000/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ queryText: "I have a complex unknown PCIe error 0x800F0922, please escalate to admin" })
  });
  const dataChatEscalation = await resChatEscalation.json();
  console.log(`Chat ActionType: ${dataChatEscalation.actionType}`);
  console.log(`Admin Live Reply: "${dataChatEscalation.actionDetails?.adminLiveReply?.slice(0, 60)}..."`);
  console.log(`Agent Learned Rule: "${dataChatEscalation.actionDetails?.learnedRule?.slice(0, 60)}..."`);
  console.log(`Final Decision Options:`, Object.keys(dataChatEscalation.actionDetails?.finalActions || {}));
}

check().catch(console.error);
