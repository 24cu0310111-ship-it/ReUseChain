import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedProfile() {
  const profile = await prisma.userProfile.upsert({
    where: { id: "user_default" },
    update: {
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
    create: {
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

  console.log("Seeded UserProfile:", profile.fullName, profile.addressLine, profile.pinCode);
}

seedProfile()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
