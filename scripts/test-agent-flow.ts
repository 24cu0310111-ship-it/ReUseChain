async function test() {
  const tests = [
    { label: "Hardware Scan", q: "Can you scan my PC hardware?" },
    { label: "System Repair", q: "My computer is running slow and hot, please fix it" },
    { label: "Doorstep Booking", q: "Book a doorstep technician for tomorrow 10am" },
    { label: "Screen / BSOD Analysis", q: "Here is a photo of the blue screen crash" },
    { label: "Keyboard Diagnostic", q: "The keys on my keyboard are not working" }
  ];

  for (const t of tests) {
    console.log(`\n========================================`);
    console.log(`Testing: ${t.label}`);
    console.log(`Query: "${t.q}"`);
    const res = await fetch("http://localhost:3000/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queryText: t.q, assetTag: "ASSET-0142" })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`ActionType: ${data.actionType}`);
    console.log(`Completion Message: ${data.completionMessage}`);
    if (data.actionDetails) {
      console.log(`Action Details:`, Object.keys(data.actionDetails));
    }
  }
}

test().catch(console.error);
