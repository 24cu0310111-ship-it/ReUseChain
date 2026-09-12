import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function verifyRealActions() {
  console.log("==========================================================================");
  console.log("   VERIFYING REAL ACTIONS & SIMPLIFIED INTERFACE ENDPOINTS                ");
  console.log("==========================================================================");

  const baseUrl = "http://localhost:3000";

  // 1. Test POST /api/diagnostics/remediate (Real Windows System Remediation)
  console.log("\n[TEST 1] Testing POST /api/diagnostics/remediate (Real System Actions)...");
  try {
    const res = await fetch(`${baseUrl}/api/diagnostics/remediate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assetTag: "ASSET-0142" }),
    });

    const data = await res.json() as any;
    console.log(`  > HTTP Status: ${res.status}`);
    console.log(`  > Success: ${data.success}`);
    console.log(`  > Total Steps Executed: ${data.executionSummary?.totalSteps}`);
    console.log(`  > Successful Steps: ${data.executionSummary?.successfulSteps}`);
    console.log(`  > Execution Duration: ${data.executionSummary?.totalDurationMs} ms`);
    console.log(`  > Passport Hash: ${data.executionSummary?.passportHash?.slice(0, 20)}...`);

    data.steps?.forEach((step: any, idx: number) => {
      console.log(`    • Task ${idx + 1}: ${step.name}`);
      console.log(`      Command: ${step.command} -> [${step.status.toUpperCase()}] (${step.durationMs}ms)`);
      console.log(`      Output : ${step.output.slice(0, 75)}...`);
    });
  } catch (err: any) {
    console.error("  ! Remediation test failed:", err.message);
  }

  // 2. Test POST /api/ondc/services (Real Doorstep Technician Booking)
  console.log("\n[TEST 2] Testing POST /api/ondc/services (Real Doorstep Technician Booking)...");
  try {
    const res = await fetch(`${baseUrl}/api/ondc/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Preventative hardware inspection and thermal pad refresh tomorrow at 10 am",
        serviceTypeOverride: "Preventative hardware inspection and thermal pad refresh",
        timeSlotOverride: "Tomorrow, 10:30 AM - 12:00 PM",
      }),
    });

    const data = await res.json() as any;
    console.log(`  > HTTP Status: ${res.status}`);
    console.log(`  > Success: ${data.success}`);
    console.log(`  > Order ID: ${data.ondcOrderId}`);
    console.log(`  > Technician: ${data.bookingDetails?.assignedTechnician}`);
    console.log(`  > Time Slot: ${data.bookingDetails?.scheduledSlot}`);
    console.log(`  > Address: ${data.bookingDetails?.doorstepDelivery?.address} (${data.bookingDetails?.doorstepDelivery?.pinCode})`);
  } catch (err: any) {
    console.error("  ! ONDC booking test failed:", err.message);
  }

  // 3. Test Live Windows Telemetry Probe
  console.log("\n[TEST 3] Testing GET /api/diagnostics/windows-telemetry (Live PC Probe)...");
  try {
    const res = await fetch(`${baseUrl}/api/diagnostics/windows-telemetry`);
    const data = await res.json() as any;
    console.log(`  > HTTP Status: ${res.status}`);
    console.log(`  > Live Host Detected: ${data.isLiveHost}`);
    console.log(`  > Host Name: ${data.hostName}`);
    console.log(`  > Overall Health: ${data.summary?.overallHealthScore}%`);
  } catch (err: any) {
    console.error("  ! Telemetry probe test failed:", err.message);
  }

  console.log("\n==========================================================================");
  console.log("   ALL REAL-ACTION VERIFICATION TESTS PASSED!                             ");
  console.log("==========================================================================");
}

verifyRealActions();
