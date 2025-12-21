import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const developers = await prisma.developer.findMany({
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
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

    const developersWithStats = developers.map((dev) => {
      const reviewCount = dev.reviews.length;
      let averageScore = 0;

      if (reviewCount > 0) {
        const totalScore = dev.reviews.reduce((acc, review) => {
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

      return {
        id: dev.id,
        bio: dev.bio,
        githubUrl: dev.githubUrl,
        user: dev.user,
        averageScore,
        reviewCount,
      };
    });

    // Sort by average score descending
    developersWithStats.sort((a, b) => b.averageScore - a.averageScore);

    return NextResponse.json(developersWithStats);
  } catch (error) {
    console.error("Failed to fetch developers:", error);
    return NextResponse.json(
      { error: "Failed to fetch developers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bio, githubUrl } = await request.json();

    if (!githubUrl) {
      return NextResponse.json(
        { error: "GitHub URL is required" },
        { status: 400 }
      );
    }

    // Check if already registered
    const existing = await prisma.developer.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already registered as developer" },
        { status: 400 }
      );
    }

    const developer = await prisma.developer.create({
      data: {
        userId: session.user.id,
        bio,
        githubUrl,
      },
    });

    return NextResponse.json(developer);
  } catch (error) {
    console.error("Failed to create developer:", error);
    return NextResponse.json(
      { error: "Failed to create developer" },
      { status: 500 }
    );
  }
}
