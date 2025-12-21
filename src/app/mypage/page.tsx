"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { WindowFrame } from "@/components/layout/window-frame";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TierBadge } from "@/components/tier-badge";

interface Developer {
  id: string;
  bio: string | null;
  averageScore: number;
  reviewCount: number;
}

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
  developer: {
    id: string;
    user: {
      name: string | null;
      image: string | null;
    };
  };
}

export default function MyPage() {
  const { data: session, status } = useSession();
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      // Fetch my developer profile
      const devRes = await fetch("/api/me/developer");
      if (devRes.ok) {
        const devData = await devRes.json();
        setDeveloper(devData);
      }

      // Fetch my reviews
      const reviewRes = await fetch("/api/me/reviews");
      if (reviewRes.ok) {
        const reviewData = await reviewRes.json();
        setReviews(reviewData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
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

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReviews(reviews.filter((r) => r.id !== reviewId));
      }
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <WindowFrame title="로딩 중..." icon="👤" showBack>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </WindowFrame>
    );
  }

  if (!session) {
    return (
      <WindowFrame title="로그인 필요" icon="🔒" showBack>
        <div className="text-center py-12 text-gray-500">
          마이페이지를 보려면 로그인이 필요합니다
        </div>
      </WindowFrame>
    );
  }

  return (
    <WindowFrame title="마이페이지" icon="👤" showBack>
      <div className="space-y-6">
        {/* Profile */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={session.user?.image || ""} />
            <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">{session.user?.name}</h1>
            <p className="text-gray-500 text-sm">{session.user?.email}</p>
          </div>
        </div>

        {/* Developer Profile Section */}
        {developer ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TierBadge score={developer.averageScore} />
                <div>
                  <span className="font-medium">
                    {developer.averageScore.toFixed(1)}점
                  </span>
                  <span className="text-gray-500 text-sm ml-2">
                    (평가 {developer.reviewCount}개)
                  </span>
                </div>
              </div>
              <Link href={`/developers/${developer.id}`}>
                <Button variant="outline" size="sm">
                  내 프로필 보기
                </Button>
              </Link>
            </div>
            {developer.bio && (
              <p className="text-sm text-gray-600 mt-2">{developer.bio}</p>
            )}
          </div>
        ) : (
          <Link href="/register">
            <Button className="w-full">개발자로 등록하기</Button>
          </Link>
        )}

        <Separator />

        {/* My Reviews */}
        <div className="space-y-4">
          <h2 className="font-semibold">📝 내가 작성한 평가</h2>

          {reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              작성한 평가가 없습니다
            </p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={review.developer.user.image || ""}
                        />
                        <AvatarFallback>
                          {review.developer.user.name?.[0] || "D"}
                        </AvatarFallback>
                      </Avatar>
                      <Link
                        href={`/developers/${review.developer.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {review.developer.user.name} 님에게
                      </Link>
                      <span className="text-sm text-gray-500">
                        ⭐ {getReviewAverage(review).toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-2 text-sm">{review.comment}</p>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </WindowFrame>
  );
}
