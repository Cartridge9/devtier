import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      developerId,
      documentation,
      speed,
      codeQuality,
      communication,
      planning,
      personality,
      comment,
    } = await request.json();

    // Validate scores
    const scores = [
      documentation,
      speed,
      codeQuality,
      communication,
      planning,
      personality,
    ];
    if (scores.some((s) => s < 1 || s > 10)) {
      return NextResponse.json(
        { error: "Scores must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Check if developer exists
    const developer = await prisma.developer.findUnique({
      where: { id: developerId },
    });

    if (!developer) {
      return NextResponse.json(
        { error: "Developer not found" },
        { status: 404 }
      );
    }

    // Prevent self-review
    if (developer.userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot review yourself" },
        { status: 400 }
      );
    }

    // Check for duplicate review
    const existingReview = await prisma.review.findUnique({
      where: {
        reviewerId_developerId: {
          reviewerId: session.user.id,
          developerId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Already reviewed this developer" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        reviewerId: session.user.id,
        developerId,
        documentation,
        speed,
        codeQuality,
        communication,
        planning,
        personality,
        comment,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Failed to create review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
