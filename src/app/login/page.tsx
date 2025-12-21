"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { WindowFrame } from "@/components/layout/window-frame";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <WindowFrame title="로딩 중..." icon="🔐">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </WindowFrame>
    );
  }

  return (
    <WindowFrame title="로그인" icon="🔐">
      <div className="text-center space-y-8 py-8">
        <div>
          <h1 className="text-3xl font-bold">🏆 DevTier</h1>
          <p className="text-gray-500 mt-2">
            개발자를 평가하고 티어를 확인하세요
          </p>
        </div>

        <Button
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className="w-full max-w-xs mx-auto"
          size="lg"
        >
          🐙 GitHub로 로그인
        </Button>

        <p className="text-xs text-gray-400">
          로그인하면 개발자를 평가하고
          <br />
          자신을 개발자로 등록할 수 있습니다
        </p>
      </div>
    </WindowFrame>
  );
}
