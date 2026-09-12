import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

async function main() {
  console.log("Seeding ReUseChain database...");

  // Clean existing tables
  await prisma.outcome.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.decisionCase.deleteMany();
  await prisma.passportEvent.deleteMany();
  await prisma.healthSample.deleteMany();
  await prisma.repairQuote.deleteMany();
  await prisma.diagnosticReport.deleteMany();
  await prisma.component.deleteMany();
  await prisma.device.deleteMany();
  await prisma.manualPart.deleteMany();
  await prisma.reuseOption.deleteMany();

  // 1. Curated Manuals & Parts Catalogue
  const parts = [
    {
      deviceModel: "Dell Latitude 5420",
      componentType: "battery",
      compatiblePartNo: "DELL-5420-BATT-63WH",
      partDescription: "Dell 4-Cell 63Wh Lithium-Ion Battery (Type RJ40G)",
      manualUrl: "https://dell.com/support/manuals/latitude-5420/battery-removal",
      estimatedPrice: 48.0,
      isAvailable: true,
      supplier: "Dell OEM Certified",
    },
    {
      deviceModel: "Dell Latitude 5420",
      componentType: "ssd",
      compatiblePartNo: "NVME-M2-512GB-GEN3",
      partDescription: "Kioxia 512GB M.2 2280 NVMe PCIe Gen3x4 SSD",
      manualUrl: "https://dell.com/support/manuals/latitude-5420/ssd-removal",
      estimatedPrice: 42.0,
      isAvailable: true,
      supplier: "Crucial / Micron",
    },
    {
      deviceModel: "Dell Latitude 5420",
      componentType: "ram",
      compatiblePartNo: "DDR4-SODIMM-16GB-3200",
      partDescription: "Kingston 16GB DDR4-3200MHz Non-ECC SODIMM",
      manualUrl: "https://dell.com/support/manuals/latitude-5420/memory-removal",
      estimatedPrice: 36.0,
      isAvailable: true,
      supplier: "Kingston Technology",
    },
    {
      deviceModel: "Dell Latitude 5420",
      componentType: "display",
      compatiblePartNo: "DELL-5420-FHD-IPS-14",
      partDescription: "14.0-inch FHD (1920x1080) Non-Touch Anti-Glare IPS Panel",
      manualUrl: "https://dell.com/support/manuals/latitude-5420/display-assembly",
      estimatedPrice: 145.0,
      isAvailable: true,
      supplier: "ScreenDirect OEM",
    },
    {
      deviceModel: "Lenovo ThinkPad T14 Gen 2",
      componentType: "display",
      compatiblePartNo: "LEN-T14-FHD-IPS-14",
      partDescription: "14.0-inch FHD (1920x1080) Low Power IPS Display Assembly",
      manualUrl: "https://support.lenovo.com/thinkpad-t14-gen2/hmm",
      estimatedPrice: 185.0,
      isAvailable: true,
      supplier: "Lenovo Parts Express",
    },
    {
      deviceModel: "Lenovo ThinkPad T14 Gen 2",
      componentType: "battery",
      compatiblePartNo: "LEN-T14-BATT-50WH",
      partDescription: "Lenovo 3-Cell 50Wh Internal Li-Polymer Battery",
      manualUrl: "https://support.lenovo.com/thinkpad-t14-gen2/battery",
      estimatedPrice: 54.0,
      isAvailable: true,
      supplier: "Lenovo Parts Direct",
    },
    {
      deviceModel: "HP ProBook 450 G8",
      componentType: "motherboard",
      compatiblePartNo: "HP-450G8-SYSBD-I5",
      partDescription: "HP System Board with Intel Core i5-1135G7 Processor",
      manualUrl: "https://support.hp.com/probook-450-g8/sysbd",
      estimatedPrice: 240.0,
      isAvailable: false,
      supplier: "HP Authorized Spares",
    },
    {
      deviceModel: "HP ProBook 450 G8",
      componentType: "battery",
      compatiblePartNo: "HP-450G8-BATT-45WH",
      partDescription: "HP 3-Cell 45Wh Long Life Li-ion Battery",
      manualUrl: "https://support.hp.com/probook-450-g8/battery",
      estimatedPrice: 45.0,
      isAvailable: true,
      supplier: "HP Direct",
    },
    {
      deviceModel: "Apple MacBook Air M1",
      componentType: "battery",
      compatiblePartNo: "APL-MBA-M1-BATT-49WH",
      partDescription: "Apple 49.9Wh Integrated Lithium-Polymer Battery Pack",
      manualUrl: "https://support.apple.com/manuals/macbook-air-m1",
      estimatedPrice: 79.0,
      isAvailable: true,
      supplier: "Apple Self-Service Parts",
    },
  ];

  for (const p of parts) {
    await prisma.manualPart.create({ data: p });
  }

  // 2. Curated Reuse Directory
  const reuseOptions = [
    {
      componentType: "ssd",
      targetRole: "Internal IT High-Speed Storage Spares Pool",
      prerequisites: "SMART Wear >= 70%, zero bad sectors, NIST 800-88 cryptographic wipe certificate",
      safetyNotes: "Anti-static shielded pouch storage required",
      policyStatus: "approved",
    },
    {
      componentType: "ram",
      targetRole: "Internal Fleet SODIMM Upgrade Stock",
      prerequisites: "Passed MemTest86 4-cycle verification, zero uncorrectable errors",
      safetyNotes: "Inspect contact fingers for oxidation or scoring",
      policyStatus: "approved",
    },
    {
      componentType: "motherboard",
      targetRole: "Headless Linux Node / Digital Signage Controller",
      prerequisites: "Stable DC power rails, active CPU/RAM, verified HDMI/USB connectivity",
      safetyNotes: "Enclosed metal chassis with active cooling and standoff isolation",
      policyStatus: "approved",
    },
    {
      componentType: "display",
      targetRole: "Fleet Panel Replacement Stock",
      prerequisites: "Zero dead pixel clusters, intact ribbon cable and hinge brackets",
      safetyNotes: "Handle panel edges with anti-static gloves",
      policyStatus: "approved",
    },
    {
      componentType: "battery",
      targetRole: "Same-Model Emergency Mobile Spares",
      prerequisites: "Health >= 75%, zero physical cell swelling, cycle count < 500",
      safetyNotes: "Mandatory thermal impedance verification; store at 50% charge",
      policyStatus: "restricted",
    },
  ];

  for (const r of reuseOptions) {
    await prisma.reuseOption.create({ data: r });
  }

  // 3. Case A: Dell Latitude 5420 (Precision Repair Scenario)
  const deviceA = await prisma.device.create({
    data: {
      assetTag: "ASSET-0142",
      serialHash: sha256("DELL-LAT-5420-SN-89412"),
      organisation: "Hindustan University - Computing Sciences",
      make: "Dell Inc.",
      model: "Latitude 5420",
      ageMonths: 36,
      lifecycleStatus: "flagged",
      currentRole: "Faculty Workstation",
    },
  });

  const compA_batt = await prisma.component.create({
    data: {
      deviceId: deviceA.id,
      type: "battery",
      model: "Dell RJ40G 63Wh Li-ion",
      serialHash: sha256("BATT-DELL-89412"),
      isReplaceable: true,
      pairingRestriction: false,
      healthPercent: 51.5,
      currentStatus: "declining",
      specsJson: JSON.stringify({ designWh: 63, fullChargeWh: 32.5, cycles: 684, chemistry: "Li-ion", tempC: 28.5 }),
    },
  });

  const compA_ssd = await prisma.component.create({
    data: {
      deviceId: deviceA.id,
      type: "ssd",
      model: "Kioxia KBG40ZNS512G NVMe",
      isReplaceable: true,
      healthPercent: 92.0,
      currentStatus: "healthy",
      specsJson: JSON.stringify({ sizeGb: 512, smartWearPercent: 8, uncorrectableErrors: 0, powerOnHours: 6420 }),
    },
  });

  const compA_ram = await prisma.component.create({
    data: {
      deviceId: deviceA.id,
      type: "ram",
      model: "Kingston 16GB DDR4-3200",
      isReplaceable: true,
      healthPercent: 100.0,
      currentStatus: "healthy",
      specsJson: JSON.stringify({ sizeGb: 16, slotsUsed: 1, maxSlots: 2, errors: 0 }),
    },
  });

  const compA_disp = await prisma.component.create({
    data: {
      deviceId: deviceA.id,
      type: "display",
      model: "14.0 FHD IPS Matte",
      isReplaceable: true,
      healthPercent: 95.0,
      currentStatus: "healthy",
      specsJson: JSON.stringify({ resolution: "1920x1080", deadPixels: 0, scratches: false }),
    },
  });

  // Seed historical health samples for Battery in Device A
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const capacity = 38.0 - (38.0 - 32.5) * ((30 - i) / 30);
    await prisma.healthSample.create({
      data: {
        componentId: compA_batt.id,
        timestamp: d,
        metricName: "full_charge_capacity_wh",
        metricValue: parseFloat(capacity.toFixed(2)),
        source: "Windows.Power.BatteryReport",
        confidence: "high",
      },
    });
  }

  // Seed simulated repair quote for Device A Battery
  await prisma.repairQuote.create({
    data: {
      componentId: compA_batt.id,
      labourCost: 25.0,
      partCost: 48.0,
      totalCost: 73.0,
      vendorName: "Campus IT Hardware Depot",
      turnaroundHours: 24,
      status: "simulated",
      expiry: new Date(now.getTime() + 14 * 24 * 3600 * 1000),
    },
  });

  // Circularity Passport for Device A
  let prevHash = "0000000000000000000000000000000000000000000000000000000000000000";
  const event1Payload = `DEVICE_ENROLLED:${deviceA.id}:2023-09-12`;
  const hash1 = sha256(prevHash + event1Payload);
  await prisma.passportEvent.create({
    data: {
      deviceId: deviceA.id,
      eventCategory: "identity",
      eventType: "DEVICE_ENROLLED",
      actor: "IT Inventory Auto-Sync",
      description: "Device enrolled in ReUseChain monitoring fleet under Faculty allocation.",
      eventHash: hash1,
      prevHash: prevHash,
      timestamp: new Date(now.getTime() - 36 * 30 * 24 * 3600 * 1000),
    },
  });

  const event2Payload = `TELEMETRY_INGESTED:${compA_batt.id}:Health 51.5%`;
  const hash2 = sha256(hash1 + event2Payload);
  await prisma.passportEvent.create({
    data: {
      deviceId: deviceA.id,
      componentId: compA_batt.id,
      eventCategory: "health",
      eventType: "WEAR_THRESHOLD_CROSSED",
      actor: "Windows Diagnostic Collector",
      description: "Battery full-charge capacity declined to 32.5Wh (51.5% of design capacity).",
      eventHash: hash2,
      prevHash: hash1,
      timestamp: new Date(now.getTime() - 2 * 3600 * 1000),
    },
  });

  // 4. Case B: Lenovo ThinkPad T14 (Cross-Purpose Reuse Scenario)
  const deviceB = await prisma.device.create({
    data: {
      assetTag: "ASSET-0289",
      serialHash: sha256("LENOVO-T14-SN-55201"),
      organisation: "Hindustan University - Robotics & AI Lab",
      make: "Lenovo",
      model: "ThinkPad T14 Gen 2",
      ageMonths: 42,
      lifecycleStatus: "flagged",
      currentRole: "Robotics Workstation",
    },
  });

  await prisma.component.create({
    data: {
      deviceId: deviceB.id,
      type: "display",
      model: "14.0 FHD Low-Power IPS",
      isReplaceable: true,
      healthPercent: 0.0,
      currentStatus: "failed",
      specsJson: JSON.stringify({ issue: "Shattered panel, severed LVDS ribbon, broken left hinge assembly", replacementQuote: 185.0 }),
    },
  });

  const compB_ssd = await prisma.component.create({
    data: {
      deviceId: deviceB.id,
      type: "ssd",
      model: "Kioxia 512GB NVMe M.2",
      isReplaceable: true,
      healthPercent: 88.0,
      currentStatus: "healthy",
      specsJson: JSON.stringify({ sizeGb: 512, smartWearPercent: 12, badSectors: 0, wipeStatus: "pending_harvest" }),
    },
  });

  const compB_ram = await prisma.component.create({
    data: {
      deviceId: deviceB.id,
      type: "ram",
      model: "Samsung 16GB DDR4-3200",
      isReplaceable: true,
      healthPercent: 100.0,
      currentStatus: "healthy",
      specsJson: JSON.stringify({ sizeGb: 16, passedMemTest: true }),
    },
  });

  await prisma.component.create({
    data: {
      deviceId: deviceB.id,
      type: "motherboard",
      model: "ThinkPad T14 Ryzen 5 Pro System Board",
      isReplaceable: true,
      healthPercent: 92.0,
      currentStatus: "healthy",
      specsJson: JSON.stringify({ bootVerified: true, dcRailsStable: true, thermalFanOk: true }),
    },
  });

  // Passport for Device B
  const bHash1 = sha256("00000000000000000000000000000000" + deviceB.id);
  await prisma.passportEvent.create({
    data: {
      deviceId: deviceB.id,
      eventCategory: "health",
      eventType: "PHYSICAL_DAMAGE_REPORTED",
      actor: "Technician Field Inspection",
      description: "Severe panel shatter reported. Display replacement cost ($185) exceeds 40% threshold of $280 refurbished value.",
      eventHash: bHash1,
      timestamp: new Date(now.getTime() - 24 * 3600 * 1000),
    },
  });

  // 5. Case C: HP ProBook 450 G8 (Certified Recycling Scenario - Blocked Wipe Gate)
  const deviceC = await prisma.device.create({
    data: {
      assetTag: "ASSET-0315",
      serialHash: sha256("HP-PROBOOK-450-SN-11094"),
      organisation: "Hindustan University - Administration",
      make: "HP",
      model: "ProBook 450 G8",
      ageMonths: 52,
      lifecycleStatus: "quarantine",
      currentRole: "Admin Records Terminal",
    },
  });

  await prisma.component.create({
    data: {
      deviceId: deviceC.id,
      type: "motherboard",
      model: "HP 450 G8 System Board",
      isReplaceable: false,
      healthPercent: 0.0,
      currentStatus: "failed",
      specsJson: JSON.stringify({ failureMode: "19V primary rail short circuit, burnt VRM components, repair uneconomical" }),
    },
  });

  await prisma.component.create({
    data: {
      deviceId: deviceC.id,
      type: "battery",
      model: "HP 45Wh Li-ion",
      isReplaceable: true,
      healthPercent: 32.0,
      currentStatus: "critical",
      specsJson: JSON.stringify({ swellDetected: true, thermalImpedanceHigh: true, safetyNotice: "HAZARDOUS: Do not reuse" }),
    },
  });

  await prisma.component.create({
    data: {
      deviceId: deviceC.id,
      type: "ssd",
      model: "Intel 512GB M.2 PCIe",
      isReplaceable: true,
      healthPercent: 64.0,
      currentStatus: "declining",
      specsJson: JSON.stringify({ sizeGb: 512, sanitizationStatus: "UNVERIFIED", nistCertificateHash: null }),
    },
  });

  // Passport for Device C
  const cHash1 = sha256("00000000000000000000000000000000" + deviceC.id);
  await prisma.passportEvent.create({
    data: {
      deviceId: deviceC.id,
      eventCategory: "control",
      eventType: "RECYCLE_DISPOSAL_BLOCKED",
      actor: "ReUseChain Policy Engine",
      description: "Disposal blocked in RED tier: Mandatory NIST 800-88 cryptographic data sanitization certificate missing.",
      eventHash: cHash1,
      timestamp: new Date(now.getTime() - 12 * 3600 * 1000),
    },
  });

  // 6. Case D: Apple MacBook Air M1 (Predictive Early Degradation Velocity Scenario)
  const deviceD = await prisma.device.create({
    data: {
      assetTag: "ASSET-0477",
      serialHash: sha256("APPLE-MBA-M1-SN-77219"),
      organisation: "Hindustan University - Design Studio",
      make: "Apple",
      model: "MacBook Air M1",
      ageMonths: 18,
      lifecycleStatus: "monitored",
      currentRole: "Graphics Design Terminal",
    },
  });

  const compD_batt = await prisma.component.create({
    data: {
      deviceId: deviceD.id,
      type: "battery",
      model: "Apple 49.9Wh Integrated",
      isReplaceable: true,
      healthPercent: 74.0,
      currentStatus: "declining",
      specsJson: JSON.stringify({
        designWh: 49.9,
        fullChargeWh: 36.9,
        cycleCount: 420,
        degradationSlope: -0.32,
        cohortMeanSlope: -0.09,
        velocityRatio: 3.55,
      }),
    },
  });

  await prisma.component.create({
    data: {
      deviceId: deviceD.id,
      type: "ssd",
      model: "Apple Integrated 256GB NVMe",
      isReplaceable: false,
      healthPercent: 96.0,
      currentStatus: "healthy",
      specsJson: JSON.stringify({ sizeGb: 256, smartWearPercent: 4 }),
    },
  });

  // Time-series samples for Device D showing accelerated slope
  for (let i = 30; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const cap = 44.0 - (44.0 - 36.9) * ((30 - i) / 30);
    await prisma.healthSample.create({
      data: {
        componentId: compD_batt.id,
        timestamp: d,
        metricName: "full_charge_capacity_wh",
        metricValue: parseFloat(cap.toFixed(2)),
        source: "AppleSystemProfiler.Battery",
        confidence: "high",
      },
    });
  }

  console.log("Seeding complete: 4 devices, 14 components, parts catalogue, reuse options, and passport timelines.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
