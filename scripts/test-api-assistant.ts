async function testApi() {
  const cases = [
    {
      name: "Standard Thermal/Battery Wear (Repair Path)",
      body: {
        queryText: "Battery dies in 20 min, fan running loud",
        assetTag: "ASSET-0142",
        liveTelemetry: { tempC: 86, cpuLoadPercent: 90, batteryHealth: 50 },
      },
    },
    {
      name: "Shattered Display (Reuse / Salvage Path)",
      body: {
        queryText: "Display panel shattered from drop, motherboard boots cleanly",
        assetTag: "ASSET-0142",
      },
    },
    {
      name: "Novel Liquid Spill (Admin Escalation Loop)",
      body: {
        queryText: "Coffee liquid spill across motherboard with burnt smell",
        assetTag: "ASSET-0142",
      },
    },
    {
      name: "Dead Endpoint (Emergency Support Bot Alert)",
      body: {
        queryText: "Endpoint offline, power controller unresponsive",
        assetTag: "ASSET-0315",
        liveTelemetry: { isOnline: false },
      },
    },
  ];

  for (const c of cases) {
    try {
      const res = await fetch("http://localhost:3000/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c.body),
      });
      const data = await res.json();
      console.log(`\n=== Scenario: ${c.name} ===`);
      console.log(`HTTP Status: ${res.status}`);
      console.log(`Escalated to Admin: ${data.isEscalated}`);
      if (data.isEscalated) {
        console.log(`Escalation ID: ${data.escalationId}`);
        console.log(`Summary: ${data.triageSummary}`);
      } else {
        console.log(`Recommended Path: ${data.recommendedPath}`);
        console.log(`Action Headline: ${data.actionHeadline}`);
        console.log(`Action Type: ${data.dispatchAction?.type}`);
        console.log(`Action Label: ${data.dispatchAction?.label}`);
        console.log(`Heavy Load Warning: ${data.heavyLoadWarning || "None"}`);
        console.log(`Passport Hash: ${data.passportHash?.slice(0, 16)}`);
      }
    } catch (e: any) {
      console.error(`Error in ${c.name}:`, e.message);
    }
  }
}

testApi().catch(console.error);
