import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const developer = await prisma.developer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!developer) {
      return NextResponse.json(
        { error: "Developer not found" },
        { status: 404 }
      );
    }

    const reviewCount = developer.reviews.length;
    let averageScore = 0;
    let categoryAverages = {
      documentation: 0,
      speed: 0,
      codeQuality: 0,
      communication: 0,
      planning: 0,
      personality: 0,
    };

    if (reviewCount > 0) {
      const totals = developer.reviews.reduce(
        (acc, review) => ({
          documentation: acc.documentation + review.documentation,
          speed: acc.speed + review.speed,
          codeQuality: acc.codeQuality + review.codeQuality,
          communication: acc.communication + review.communication,
          planning: acc.planning + review.planning,
          personality: acc.personality + review.personality,
        }),
        {
          documentation: 0,
          speed: 0,
          codeQuality: 0,
          communication: 0,
          planning: 0,
          personality: 0,
        }
      );

      categoryAverages = {
        documentation: totals.documentation / reviewCount,
        speed: totals.speed / reviewCount,
        codeQuality: totals.codeQuality / reviewCount,
        communication: totals.communication / reviewCount,
        planning: totals.planning / reviewCount,
        personality: totals.personality / reviewCount,
      };

      averageScore =
        (categoryAverages.documentation +
          categoryAverages.speed +
          categoryAverages.codeQuality +
          categoryAverages.communication +
          categoryAverages.planning +
          categoryAverages.personality) /
        6;
    }

    return NextResponse.json({
      ...developer,
      averageScore,
      categoryAverages,
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
