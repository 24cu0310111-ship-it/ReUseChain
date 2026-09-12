import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function runTests() {
  console.log("==========================================================================");
  console.log("   TESTING WINDOWS TELEMETRY & MULTI-AGENT INGESTION PIPELINE             ");
  console.log("==========================================================================");

  const baseUrl = "http://localhost:3000";

  // 1. Test GET /api/diagnostics/windows-telemetry
  console.log("\n[TEST 1] Testing GET /api/diagnostics/windows-telemetry (Live Host Probe)...");
  try {
    const res = await fetch(`${baseUrl}/api/diagnostics/windows-telemetry`);
    const data = await res.json() as any;
    console.log(`  > Status: ${res.status}`);
    console.log(`  > Success: ${data.success}`);
    console.log(`  > Live Host Detected: ${data.isLiveHost}`);
    console.log(`  > Overall Health Score: ${data.summary?.overallHealthScore}% (${data.summary?.healthStatus})`);
    console.log(`  > Components Diagnosed: ${Object.keys(data.componentStats || {}).join(", ")}`);

    const cpu = data.componentStats?.cpu;
    if (cpu) {
      console.log(`\n  --- Individual Component: CPU ---`);
      console.log(`    • Model: ${cpu.wmi?.name}`);
      console.log(`    • Cores: ${cpu.wmi?.numberOfCores}, Threads: ${cpu.wmi?.numberOfLogicalProcessors}`);
      console.log(`    • Load %: ${cpu.performanceCounters?.percentProcessorTime}%`);
      console.log(`    • Health Score: ${cpu.healthScore}% (${cpu.status})`);
      console.log(`    • Agent Verdict: ${cpu.agentDiagnosis?.verdict}`);
    }

    const ram = data.componentStats?.ram;
    if (ram) {
      console.log(`\n  --- Individual Component: RAM ---`);
      console.log(`    • Capacity: ${ram.wmi?.totalCapacityGB} GB`);
      console.log(`    • Available: ${ram.performanceCounters?.availableMBytes} MB`);
      console.log(`    • Health Score: ${ram.healthScore}% (${ram.status})`);
      console.log(`    • Agent Verdict: ${ram.agentDiagnosis?.verdict}`);
    }

    const net = data.componentStats?.network;
    if (net) {
      console.log(`\n  --- Individual Component: Network ---`);
      console.log(`    • Events Filtered: ${net.eventLog?.relevantEvents?.length || 0}`);
      console.log(`    • Health Score: ${net.healthScore}% (${net.status})`);
      console.log(`    • Agent Verdict: ${net.agentDiagnosis?.verdict}`);
    }
  } catch (err: any) {
    console.error("  ! GET Test failed:", err.message);
  }

  // 2. Test POST /api/diagnostics/windows-telemetry with fault payload
  console.log("\n[TEST 2] Testing POST /api/diagnostics/windows-telemetry (Disk Failure Scenario)...");
  try {
    const postPayload = {
      assetTag: "ASSET-0142",
      testScenario: "DiskFailure",
      wmi: {
        cpu: { name: "13th Gen Intel Core i3", numberOfCores: 5, numberOfLogicalProcessors: 6 },
        disks: [{ model: "NVMe KIOXIA 512GB", sizeGB: 512, status: "Degraded" }],
      },
      perfCounters: {
        disk: { percentDiskTime: 100.0, avgDiskSecPerTransferMs: 380.0, diskReadBytesPerSec: 15000 },
      },
      eventLogs: {
        system: [
          { id: 7, providerName: "Disk", levelDisplayName: "Error", message: "The device, \\Device\\Harddisk0\\DR0, has a bad block." },
          { id: 153, providerName: "Disk", levelDisplayName: "Warning", message: "The IO operation at logical block address 0x3a4810 was retried." },
        ],
      },
    };

    const res = await fetch(`${baseUrl}/api/diagnostics/windows-telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postPayload),
    });

    const data = await res.json() as any;
    console.log(`  > Status: ${res.status}`);
    console.log(`  > Success: ${data.success}`);
    console.log(`  > Primary Defect Component: ${data.summary?.primaryDefectSubsystem}`);
    console.log(`  > Primary Defect Verdict: ${data.summary?.primaryDefectVerdict}`);
    console.log(`  > Multi-Agent Verdict: ${data.agentDossier?.triageVerdict?.toUpperCase()}`);
    console.log(`  > Agent Reasoning: ${data.agentDossier?.reasoning}`);
    console.log(`  > Action Plan: ${data.agentDossier?.recommendedAction}`);
    console.log(`  > Database Media Asset ID: ${data.databasePersistence?.mediaAssetId}`);
    console.log(`  > Passport Hash: ${data.databasePersistence?.passportHash?.slice(0, 20)}...`);
  } catch (err: any) {
    console.error("  ! POST Test failed:", err.message);
  }

  // 3. Test Collect-WindowsTelemetry.ps1
  console.log("\n[TEST 3] Testing Standalone PowerShell Script Execution (TestScenario: DiskFailure)...");
  try {
    const { stdout } = await execAsync(
      "powershell -ExecutionPolicy Bypass -File scripts\\Collect-WindowsTelemetry.ps1 -TestScenario DiskFailure -NoTransmit"
    );
    console.log(stdout.trim().slice(0, 450) + "...\n[Truncated for brevity]");
    console.log("  ✓ PowerShell script executed cleanly with code 0!");
  } catch (err: any) {
    console.error("  ! PowerShell test failed:", err.message);
  }

  console.log("\n==========================================================================");
  console.log("   ALL WINDOWS TELEMETRY & MULTI-AGENT TESTS COMPLETED!                   ");
  console.log("==========================================================================");
}

runTests();
