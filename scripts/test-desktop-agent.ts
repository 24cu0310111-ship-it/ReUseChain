async function testDesktopAgent() {
  console.log("=== RUNNING EXTERNAL DESKTOP AGENT & MEDIA/EMBEDDING TESTS ===");

  // 1. Test POST /api/media
  console.log("\n--- 1. Testing POST /api/media (Database Media & Vector Embedding Storage) ---");
  const mediaRes = await fetch("http://localhost:3000/api/media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      assetTag: "ASSET-0142",
      mediaType: "screenshot",
      fileName: "bsod_capture_0xED.png",
      ocrExtractedText: "STOP CODE: UNMOUNTABLE_BOOT_VOLUME 0x000000ED",
      metadata: { resolution: "1920x1080", os: "Windows 11" },
    }),
  }).then((r) => r.json());

  console.log("Media Upload Success:", mediaRes.success);
  console.log("Stored Media ID:", mediaRes.mediaAsset?.id);
  console.log("SHA-256 Checksum:", mediaRes.mediaAsset?.checksumSha256?.slice(0, 16));
  console.log("Embedding Model:", mediaRes.embedding?.modelName);
  console.log("Vector Dimension:", mediaRes.embedding?.vectorDimension);
  console.log("Vector Sample (5 floats):", mediaRes.embedding?.vectorSample);

  // 2. Test GET /api/media
  console.log("\n--- 2. Testing GET /api/media (Query Stored Assets) ---");
  const listMedia = await fetch("http://localhost:3000/api/media").then((r) => r.json());
  console.log("Total Stored Media Assets:", listMedia.totalCount);
  console.log("Latest Asset Filename:", listMedia.data?.[0]?.fileName);

  // 3. Test POST /api/diagnostics/external: Thermal TIM Pump-Out
  console.log("\n--- 3. Testing External AI: CPU Thermal Hotspot Delta (TIM Pump-Out) ---");
  const diag1 = await fetch("http://localhost:3000/api/diagnostics/external", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      assetTag: "ASSET-0142",
      sourceOS: "Windows 11 Enterprise (Dell Latitude 5420)",
      cpuPackageTempC: 64.0,
      cpuHotspotTempC: 92.5,
      cpuThrottlingProchot: true,
    }),
  }).then((r) => r.json());

  console.log("Specific Failing Component:", diag1.rootCauseDossier?.specificFailingComponent);
  console.log("Probable Root Cause:", diag1.rootCauseDossier?.probableRootCause);
  console.log("Evidence Chain:", diag1.rootCauseDossier?.evidenceChain);
  console.log("Media Asset Saved:", diag1.databasePersistence?.mediaAssetId);
  console.log("Vector Dimensions:", diag1.databasePersistence?.vectorDimension);
  console.log("Circularity Passport:", diag1.databasePersistence?.passportHash?.slice(0, 16));

  // 4. Test POST /api/diagnostics/external: Battery Cell Voltage Sag
  console.log("\n--- 4. Testing External AI: Battery Cell Voltage Sag ---");
  const diag2 = await fetch("http://localhost:3000/api/diagnostics/external", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      assetTag: "ASSET-0142",
      batteryDesignCapacityWh: 60.0,
      batteryFullChargeCapacityWh: 31.2,
      batteryCellImbalanceMv: 210.0,
    }),
  }).then((r) => r.json());

  console.log("Specific Failing Component:", diag2.rootCauseDossier?.specificFailingComponent);
  console.log("Probable Root Cause:", diag2.rootCauseDossier?.probableRootCause);
  console.log("Recommended Service:", diag2.rootCauseDossier?.recommendedService);

  // 5. Test POST /api/diagnostics/external: NVMe NAND Exhaustion
  console.log("\n--- 5. Testing External AI: NVMe NAND Exhaustion ---");
  const diag3 = await fetch("http://localhost:3000/api/diagnostics/external", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      assetTag: "ASSET-0142",
      nvmeWearPercent: 94.0,
      nvmeReallocatedSectors: 128,
      nvmeEccErrors: 48,
    }),
  }).then((r) => r.json());

  console.log("Specific Failing Component:", diag3.rootCauseDossier?.specificFailingComponent);
  console.log("Probable Root Cause:", diag3.rootCauseDossier?.probableRootCause);
  console.log("Afterlife Path:", diag3.rootCauseDossier?.recommendedAfterlifePath);

  console.log("\n=== ALL EXTERNAL DESKTOP AGENT & MEDIA TESTS PASSED! ===");
}

testDesktopAgent().catch(console.error);
