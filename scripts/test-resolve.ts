async function testResolve() {
  const escalations = await fetch("http://localhost:3000/api/escalations").then((r) => r.json());
  console.log("Total escalations in DB:", escalations.data?.length);
  const pending = escalations.data?.find((e: any) => e.status === "pending");

  if (pending) {
    console.log(`Resolving pending escalation ID: ${pending.id} (Query: ${pending.queryText.slice(0, 40)}...)`);
    const resolveRes = await fetch("http://localhost:3000/api/escalations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        escalationId: pending.id,
        adminResponse: "Liquid spill confirmed. Isolate power, clean with 99% isopropyl alcohol, salvage SSD/RAM into spares pool, scrap damaged chassis.",
        learnedRule: "Liquid spills require immediate motherboard power isolation and salvage of uncorroded sub-assemblies.",
        resolvedBy: "Senior IT Hardware Admin",
      }),
    });
    const result = await resolveRes.json();
    console.log("Resolution HTTP Status:", resolveRes.status);
    console.log("Message:", result.message);
    console.log("Updated Record Status:", result.data?.status);
  } else {
    console.log("No pending escalations found.");
  }
}

testResolve().catch(console.error);
