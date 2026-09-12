import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeComponentTrend } from "@/lib/trend-engine";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const device = await prisma.device.findUnique({
      where: { id },
      include: {
        components: {
          include: {
            healthSamples: {
              orderBy: { timestamp: "asc" },
            },
            repairQuotes: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
        decisionCases: {
          orderBy: { createdAt: "desc" },
          include: {
            approval: true,
            outcome: true,
          },
        },
        passportEvents: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!device) {
      return NextResponse.json({ success: false, error: "Device not found" }, { status: 404 });
    }

    // Attach trend analysis for each component
    const componentsWithTrends = device.components.map((c) => {
      const trend = analyzeComponentTrend(c.healthSamples);
      return {
        ...c,
        trendAnalysis: trend,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        ...device,
        components: componentsWithTrends,
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch device details:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
