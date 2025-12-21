"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { WindowFrame } from "@/components/layout/window-frame";
import { ScoreInput } from "@/components/score-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [developerName, setDeveloperName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scores, setScores] = useState({
    documentation: 5,
    speed: 5,
    codeQuality: 5,
    communication: 5,
    planning: 5,
    personality: 5,
  });
  const [comment, setComment] = useState("");
  const [developerId, setDeveloperId] = useState("");

  useEffect(() => {
    fetchReview();
  }, [params.id]);

  const fetchReview = async () => {
    try {
      const res = await fetch(`/api/reviews/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setScores({
          documentation: data.documentation,
          speed: data.speed,
          codeQuality: data.codeQuality,
          communication: data.communication,
          planning: data.planning,
          personality: data.personality,
        });
        setComment(data.comment);
        setDeveloperId(data.developerId);
        setDeveloperName(data.developer.user.name || "개발자");
      }
    } catch (error) {
      console.error("Failed to fetch review:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert("한줄평을 입력해주세요");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/reviews/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...scores,
          comment,
        }),
      });

      if (res.ok) {
        router.push(`/developers/${developerId}`);
      } else {
        const data = await res.json();
        alert(data.error || "평가 수정에 실패했습니다");
      }
    } catch (error) {
      console.error("Failed to update review:", error);
      alert("평가 수정에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <WindowFrame title="로딩 중..." icon="✏️" showBack>
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
          로그인이 필요합니다
        </div>
      </WindowFrame>
    );
  }

  return (
    <WindowFrame title="평가 수정" icon="✏️" showBack>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <h1 className="text-lg font-semibold">
            {developerName} 님에 대한 평가 수정
          </h1>
        </div>

        <div className="space-y-4">
          <ScoreInput
            label="문서화"
            value={scores.documentation}
            onChange={(v) => setScores({ ...scores, documentation: v })}
          />
          <ScoreInput
            label="개발 속도"
            value={scores.speed}
            onChange={(v) => setScores({ ...scores, speed: v })}
          />
          <ScoreInput
            label="코드 품질"
            value={scores.codeQuality}
            onChange={(v) => setScores({ ...scores, codeQuality: v })}
          />
          <ScoreInput
            label="연락 빈도"
            value={scores.communication}
            onChange={(v) => setScores({ ...scores, communication: v })}
          />
          <ScoreInput
            label="기획 능력"
            value={scores.planning}
            onChange={(v) => setScores({ ...scores, planning: v })}
          />
          <ScoreInput
            label="인성"
            value={scores.personality}
            onChange={(v) => setScores({ ...scores, personality: v })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">한줄평</label>
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="이 개발자에 대한 한줄평을 작성해주세요"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "수정 중..." : "평가 수정하기"}
        </Button>
      </form>
    </WindowFrame>
  );
}
