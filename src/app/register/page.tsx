"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { WindowFrame } from "@/components/layout/window-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (session?.user?.username) {
      setGithubUrl(`https://github.com/${session.user.username}`);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!githubUrl.includes("github.com")) {
      alert("올바른 GitHub URL을 입력해주세요");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/developers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl, bio }),
      });

      if (res.ok) {
        router.push("/mypage");
      } else {
        const data = await res.json();
        alert(data.error || "등록에 실패했습니다");
      }
    } catch (error) {
      console.error("Failed to register:", error);
      alert("등록에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <WindowFrame title="로딩 중..." icon="📝" showBack>
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
          개발자 등록을 하려면 로그인이 필요합니다
        </div>
      </WindowFrame>
    );
  }

  return (
    <WindowFrame title="개발자 등록" icon="📝" showBack>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <h1 className="text-lg font-semibold">개발자로 등록하기</h1>
          <p className="text-sm text-gray-500 mt-1">
            등록하면 다른 사람들이 나를 평가할 수 있어요
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              GitHub URL
            </label>
            <Input
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              자기소개 (선택)
            </label>
            <Input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="간단한 자기소개를 작성해주세요"
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "등록 중..." : "등록하기"}
        </Button>
      </form>
    </WindowFrame>
  );
}
