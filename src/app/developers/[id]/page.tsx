"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { WindowFrame } from "@/components/layout/window-frame";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/tier-badge";
import { ScoreBar } from "@/components/score-bar";
import { Separator } from "@/components/ui/separator";

interface Review {
  id: string;
  documentation: number;
  speed: number;
  codeQuality: number;
  communication: number;
  planning: number;
  personality: number;
  comment: string;
  createdAt: string;
  reviewer: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface Developer {
  id: string;
  bio: string | null;
  githubUrl: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  reviews: Review[];
  averageScore: number;
  categoryAverages: {
    documentation: number;
    speed: number;
    codeQuality: number;
    communication: number;
    planning: number;
    personality: number;
  };
  reviewCount: number;
}

export default function DeveloperDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeveloper();
  }, [params.id]);

  const fetchDeveloper = async () => {
    try {
      const res = await fetch(`/api/developers/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setDeveloper(data);
      }
    } catch (error) {
      console.error("Failed to fetch developer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchDeveloper();
      }
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  const getReviewAverage = (review: Review) => {
    return (
      (review.documentation +
        review.speed +
        review.codeQuality +
        review.communication +
        review.planning +
        review.personality) /
      6
    );
  };

  const hasReviewed = developer?.reviews.some(
    (r) => r.reviewer.id === session?.user?.id
  );

  const canReview =
    session?.user &&
    developer?.user.id !== session.user.id &&
    !hasReviewed;

  if (loading) {
    return (
      <WindowFrame title="로딩 중..." icon="👤" showBack>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </WindowFrame>
    );
  }

  if (!developer) {
    return (
      <WindowFrame title="오류" icon="❌" showBack>
        <div className="text-center py-12 text-gray-500">
          개발자를 찾을 수 없습니다
        </div>
      </WindowFrame>
    );
  }

  return (
    <WindowFrame title={developer.user.name || "개발자"} icon="👤" showBack>
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={developer.user.image || ""} />
            <AvatarFallback>{developer.user.name?.[0] || "D"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{developer.user.name}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {developer.bio || "소개가 없습니다"}
            </p>
            <a
              href={developer.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 text-sm hover:underline"
            >
              GitHub 프로필 →
            </a>
          </div>
        </div>

        {/* Score Summary */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <TierBadge score={developer.averageScore} size="lg" />
            <div>
              <span className="text-2xl font-bold">
                {developer.averageScore.toFixed(1)}
              </span>
              <span className="text-gray-500 text-sm ml-1">점</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            평가 {developer.reviewCount}개
          </p>
        </div>

        {/* Category Scores */}
        {developer.reviewCount > 0 && (
          <div className="space-y-3">
            <ScoreBar
              label="문서화"
              score={developer.categoryAverages.documentation}
            />
            <ScoreBar
              label="개발 속도"
              score={developer.categoryAverages.speed}
            />
            <ScoreBar
              label="코드 품질"
              score={developer.categoryAverages.codeQuality}
            />
            <ScoreBar
              label="연락 빈도"
              score={developer.categoryAverages.communication}
            />
            <ScoreBar
              label="기획 능력"
              score={developer.categoryAverages.planning}
            />
            <ScoreBar
              label="인성"
              score={developer.categoryAverages.personality}
            />
          </div>
        )}

        {/* Review Button */}
        {canReview && (
          <Link href={`/developers/${developer.id}/review`}>
            <Button className="w-full">✏️ 평가 작성하기</Button>
          </Link>
        )}

        {session?.user && developer.user.id === session.user.id && (
          <p className="text-center text-sm text-gray-500">
            자기 자신은 평가할 수 없습니다
          </p>
        )}

        {session?.user && hasReviewed && (
          <p className="text-center text-sm text-gray-500">
            이미 평가를 작성했습니다
          </p>
        )}

        <Separator />

        {/* Reviews List */}
        <div className="space-y-4">
          <h2 className="font-semibold">📝 평가 ({developer.reviewCount})</h2>

          {developer.reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              아직 평가가 없습니다
            </p>
          ) : (
            <div className="space-y-3">
              {developer.reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={review.reviewer.image || ""} />
                        <AvatarFallback>
                          {review.reviewer.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {review.reviewer.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        ⭐ {getReviewAverage(review).toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-2 text-sm">{review.comment}</p>
                  {session?.user?.id === review.reviewer.id && (
                    <div className="flex gap-2 mt-3">
                      <Link href={`/reviews/${review.id}/edit`}>
                        <Button variant="outline" size="sm">
                          수정
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        삭제
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </WindowFrame>
  );
}
