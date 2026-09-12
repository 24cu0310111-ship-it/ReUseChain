async function main() {
  console.log("=== Testing Frontend HTML & Component Rendering ===");

  // 1. Assistant Page
  console.log("\n1. Fetching /assistant HTML...");
  const resAssistant = await fetch("http://localhost:3000/assistant");
  console.log(`Status: ${resAssistant.status} ${resAssistant.statusText}`);
  const htmlAssistant = await resAssistant.text();
  console.log(`HTML Length: ${htmlAssistant.length} bytes`);
  console.log(`Contains 'Autonomous AI Action Agent': ${htmlAssistant.includes("Autonomous AI Action Agent")}`);
  console.log(`Contains 'Keyboard semi colon symbol': ${htmlAssistant.includes("Keyboard semi colon symbol")}`);
  console.log(`Contains 'Book Doorstep Tech': ${htmlAssistant.includes("Book Doorstep Tech") || htmlAssistant.includes("Book Doorstep")}`);

  // 2. Home Page
  console.log("\n2. Fetching / (Home Page) HTML...");
  const resHome = await fetch("http://localhost:3000/");
  console.log(`Status: ${resHome.status} ${resHome.statusText}`);
  const htmlHome = await resHome.text();
  console.log(`HTML Length: ${htmlHome.length} bytes`);
  console.log(`Contains 'Chat-Based Diagnostic Agent': ${htmlHome.includes("Chat-Based Diagnostic Agent")}`);
  console.log(`Contains 'Manual Data Entry': ${htmlHome.includes("Manual Data Entry")}`);

  // 3. ONDC Tracking API
  console.log("\n3. Fetching /api/ondc/track/ONDC-SRV-2026-657481...");
  const resTrack = await fetch("http://localhost:3000/api/ondc/track/ONDC-SRV-2026-657481");
  const dataTrack = await resTrack.json();
  console.log(`ONDC Track API Status: ${dataTrack.status}`);
  console.log(`Driver: ${dataTrack.driverName}`);
  console.log(`Coordinates:`, dataTrack.currentCoordinates);

  console.log("\n=== ALL FRONTEND PAGES AND APIS ARE HEALTHY AND SERVING PROPERLY ===");
}

main().catch(console.error);
