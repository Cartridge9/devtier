import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const developer = await prisma.developer.findUnique({
      where: { userId: session.user.id },
      include: {
        reviews: {
          select: {
            documentation: true,
            speed: true,
            codeQuality: true,
            communication: true,
            planning: true,
            personality: true,
          },
        },
      },
    });

    if (!developer) {
      return NextResponse.json(null);
    }

    const reviewCount = developer.reviews.length;
    let averageScore = 0;

    if (reviewCount > 0) {
      const totalScore = developer.reviews.reduce((acc, review) => {
        const reviewAvg =
          (review.documentation +
            review.speed +
            review.codeQuality +
            review.communication +
            review.planning +
            review.personality) /
          6;
        return acc + reviewAvg;
      }, 0);
      averageScore = totalScore / reviewCount;
    }

    return NextResponse.json({
      id: developer.id,
      bio: developer.bio,
      averageScore,
      reviewCount,
    });
  } catch (error) {
    console.error("Failed to fetch developer:", error);
    return NextResponse.json(
      { error: "Failed to fetch developer" },
      { status: 500 }
    );
  }
}
