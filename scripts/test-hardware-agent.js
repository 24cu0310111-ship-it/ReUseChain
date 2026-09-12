async function runTests() {
  console.log("=================================================");
  console.log("TESTING HARDWARE AI UNDERSTANDING & TOOL TRIGGERS");
  console.log("=================================================\n");

  const testQueries = [
    // The exact query from user screenshot
    "Keyboard semi colon symbol is that working",
    // 7 Direct Diagnostics
    "CPU usage/temperature/throttling",
    "RAM usage",
    "GPU usage",
    "Storage health",
    "Battery health",
    "Device/driver status",
    "Network status",
    // 6 Functional Tests
    "RAM memory tests",
    "GPU stress tests",
    "Storage read/write tests",
    "Network tests",
    "Audio/camera tests",
    "Keyboard/touchpad tests",
    // Baseline healthy check
    "Normal Baseline - all functioning normally"
  ];

  for (const q of testQueries) {
    try {
      const res = await fetch("http://localhost:3000/api/diagnostics/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptom: q })
      });
      const data = await res.json();
      console.log(`QUERY: "${q}"`);
      console.log(`  -> AI Model: ${data.aiModelName}`);
      console.log(`  -> Interpreted Intent: ${data.interpretedIntent}`);
      console.log(`  -> Category: ${data.testingCategory}`);
      console.log(`  -> Triggered Tool: ${data.triggeredTool?.name}`);
      console.log(`  -> Command: ${data.triggeredTool?.windowsCommand}`);
      if (data.targetDetail) {
        console.log(`  -> Target Detail: ${data.targetDetail}`);
      }
      console.log(`  -> Execution Time: ${data.triggeredTool?.executionTimeMs}ms`);
      console.log(`  -> Anomaly Found: ${data.anomalyFound}`);
      console.log("-------------------------------------------------");
    } catch (err) {
      console.error(`ERROR for "${q}":`, err.message);
    }
  }

  console.log("\n=================================================");
  console.log("TESTING CHAT AGENT (/api/assistant)");
  console.log("=================================================");
  const chatQueries = [
    "Keyboard semi colon symbol is that working",
    "GPU stress tests"
  ];
  for (const cq of chatQueries) {
    try {
      const res = await fetch("http://localhost:3000/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queryText: cq })
      });
      const data = await res.json();
      console.log(`CHAT QUERY: "${cq}"`);
      console.log(`  -> Action Type: ${data.actionType}`);
      console.log(`  -> Completion: ${data.completionMessage.slice(0, 140)}...`);
      console.log(`  -> Tool: ${data.actionDetails?.selectedTool?.name}`);
      console.log("-------------------------------------------------");
    } catch (err) {
      console.error(`ERROR for chat "${cq}":`, err.message);
    }
  }
}

runTests();
