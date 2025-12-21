"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { WindowFrame } from "@/components/layout/window-frame";
import { ScoreInput } from "@/components/score-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [developerName, setDeveloperName] = useState("");
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState({
    documentation: 5,
    speed: 5,
    codeQuality: 5,
    communication: 5,
    planning: 5,
    personality: 5,
  });
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchDeveloper();
  }, [params.id]);

  const fetchDeveloper = async () => {
    try {
      const res = await fetch(`/api/developers/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setDeveloperName(data.user.name || "개발자");
      }
    } catch (error) {
      console.error("Failed to fetch developer:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert("한줄평을 입력해주세요");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          developerId: params.id,
          ...scores,
          comment,
        }),
      });

      if (res.ok) {
        router.push(`/developers/${params.id}`);
      } else {
        const data = await res.json();
        alert(data.error || "평가 작성에 실패했습니다");
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("평가 작성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
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
          평가를 작성하려면 로그인이 필요합니다
        </div>
      </WindowFrame>
    );
  }

  return (
    <WindowFrame title="평가 작성" icon="✏️" showBack>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <h1 className="text-lg font-semibold">
            {developerName} 님을 평가합니다
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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "제출 중..." : "평가 제출하기"}
        </Button>
      </form>
    </WindowFrame>
  );
}
