import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let profile = await prisma.userProfile.findFirst({
      where: { id: "user_default" },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          id: "user_default",
          fullName: "Sarah Chen",
          email: "sarah.chen@techcorp.io",
          phoneNumber: "+91 98765 43210",
          role: "Lead Fleet Asset Manager",
          addressLine: "42 Tech Park Boulevard, Block C, Suite 402",
          city: "Bangalore",
          state: "Karnataka",
          pinCode: "560103",
          gpsCoordinates: "12.9716, 77.5946",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: profile,
      automationStatus: "FORM_FILLING_BYPASS_ENABLED",
      message: "Stored delivery address and GPS coordinates active. Single-turn prompt booking ready.",
    });
  } catch (error: any) {
    console.error("ONDC profile fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      fullName, 
      phoneNumber, 
      addressLine, 
      city, 
      state, 
      pinCode, 
      gpsCoordinates 
    } = body;

    const updated = await prisma.userProfile.upsert({
      where: { id: "user_default" },
      update: {
        ...(fullName && { fullName }),
        ...(phoneNumber && { phoneNumber }),
        ...(addressLine && { addressLine }),
        ...(city && { city }),
        ...(state && { state }),
        ...(pinCode && { pinCode }),
        ...(gpsCoordinates && { gpsCoordinates }),
      },
      create: {
        id: "user_default",
        fullName: fullName || "Sarah Chen",
        email: "sarah.chen@techcorp.io",
        phoneNumber: phoneNumber || "+91 98765 43210",
        addressLine: addressLine || "42 Tech Park Boulevard, Block C",
        city: city || "Bangalore",
        state: state || "Karnataka",
        pinCode: pinCode || "560103",
        gpsCoordinates: gpsCoordinates || "12.9716, 77.5946",
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "User profile delivery coordinates updated successfully.",
    });
  } catch (error: any) {
    console.error("ONDC profile update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
