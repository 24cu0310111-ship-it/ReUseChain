import { prisma } from "../src/lib/prisma";

async function main() {
  const existing = await prisma.adminEscalation.count();
  if (existing === 0) {
    await prisma.adminEscalation.create({
      data: {
        assetTag: "ASSET-0315",
        queryText: "User reports high pitched coil whine on motherboard and sudden system power cut under load.",
        symptomSummary: "19V system rail power cut with suspected chemical cell stress.",
        telemetrySnippet: JSON.stringify({ tempC: 88.5, railVoltage: 16.2, expectedVoltage: 19.5, fanRpm: 5400 }),
        urgency: "critical",
        status: "pending",
      },
    });
    console.log("Seeded sample admin escalation!");
  }
}

main().finally(() => prisma.$disconnect());
