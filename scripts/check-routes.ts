async function checkRoutes() {
  const routes = [
    "/",
    "/assistant",
    "/escalations",
    "/api/escalations",
    "/devices/ASSET-0142",
    "/devices/ASSET-9901",
    "/passport",
    "/passport/ASSET-0142/certificate",
    "/approvals",
    "/simulator",
    "/learning",
    "/settings",
    "/intake",
    "/desktop-agent",
    "/api/telegram",
    "/api/ondc/profile",
    "/api/ondc/services",
    "/api/media",
    "/api/diagnostics/windows-telemetry",
    "/api/diagnostics/remediate",
  ];
  const results = [];
  for (const r of routes) {
    try {
      const res = await fetch("http://localhost:3000" + r);
      results.push({ path: r, status: res.status });
    } catch (e: any) {
      results.push({ path: r, error: e.message });
    }
  }
  console.log(JSON.stringify(results, null, 2));
}

checkRoutes();
