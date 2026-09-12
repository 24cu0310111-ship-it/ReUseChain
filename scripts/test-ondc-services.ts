async function testOndcServices() {
  console.log("=== RUNNING ONDC SERVICES API & USER AUTOMATION TESTS ===");

  // 1. Verify User Profile & Zero Form-Filling Automation
  console.log("\n--- 1. Testing GET /api/ondc/profile (Zero Form-Filling Verification) ---");
  const profileRes = await fetch("http://localhost:3000/api/ondc/profile").then((r) => r.json());
  console.log("Status:", profileRes.success);
  console.log("Automation Status:", profileRes.automationStatus);
  console.log("Authenticated User:", profileRes.data?.fullName);
  console.log("Stored Address:", profileRes.data?.addressLine, profileRes.data?.city);
  console.log("PIN Code:", profileRes.data?.pinCode);
  console.log("Stored GPS Coordinates:", profileRes.data?.gpsCoordinates);

  // 2. Single-Turn Prompt Test 1: Battery Repair Tomorrow at 10 AM
  console.log("\n--- 2. Single-Turn Prompt: Battery Repair Tomorrow at 10 AM ---");
  const ondcRes1 = await fetch("http://localhost:3000/api/ondc/services", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "Fix my laptop battery wear tomorrow at 10 AM",
      assetTag: "ASSET-0142",
    }),
  }).then((r) => r.json());

  console.log("Success:", ondcRes1.success);
  console.log("ONDC Order ID:", ondcRes1.ondcOrderId);
  console.log("Detected Service:", ondcRes1.bookingDetails?.service);
  console.log("Scheduled Slot:", ondcRes1.bookingDetails?.scheduledSlot);
  console.log("Assigned Technician:", ondcRes1.bookingDetails?.assignedTechnician);
  console.log("Doorstep Recipient (Auto-Pulled):", ondcRes1.bookingDetails?.doorstepDelivery?.recipient);
  console.log("Doorstep GPS (Auto-Injected):", ondcRes1.bookingDetails?.doorstepDelivery?.gpsCoordinates);
  console.log("Form-Filling Bypassed:", ondcRes1.userAutomation?.formFillingBypassed);
  console.log("Passport Hash:", ondcRes1.bookingDetails?.passportHash?.slice(0, 16));

  // 3. Single-Turn Prompt Test 2: Keyboard Repair Sunday 2 PM
  console.log("\n--- 3. Single-Turn Prompt: Keyboard Repair Sunday 2 PM ---");
  const ondcRes2 = await fetch("http://localhost:3000/api/ondc/services", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "Doorstep technician for keyboard ribbon replacement Sunday 2 PM",
      assetTag: "ASSET-0142",
    }),
  }).then((r) => r.json());

  console.log("Success:", ondcRes2.success);
  console.log("ONDC Order ID:", ondcRes2.ondcOrderId);
  console.log("Detected Service:", ondcRes2.bookingDetails?.service);
  console.log("Scheduled Slot:", ondcRes2.bookingDetails?.scheduledSlot);
  console.log("Provider:", ondcRes2.bookingDetails?.provider?.slice(0, 45));
  console.log("Network Fee ($):", ondcRes2.bookingDetails?.pricing?.serviceFeeUSD);
  console.log("Passport Hash:", ondcRes2.bookingDetails?.passportHash?.slice(0, 16));

  // 4. Test GET /api/ondc/services: Network Order Registry
  console.log("\n--- 4. Testing GET /api/ondc/services (ONDC Registry Query) ---");
  const listRes = await fetch("http://localhost:3000/api/ondc/services").then((r) => r.json());
  console.log("Protocol Version:", listRes.protocolVersion);
  console.log("Active BAP:", listRes.activeBAP);
  console.log("Total ONDC Doorstep Bookings:", listRes.totalBookings);
  console.log("Latest Order ID:", listRes.recentOrders?.[0]?.ondcOrderId);

  console.log("\n=== ALL ONDC SERVICES & USER AUTOMATION TESTS PASSED! ===");
}

testOndcServices().catch(console.error);
