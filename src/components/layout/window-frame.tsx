"use client";

import { ReactNode } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface WindowFrameProps {
  children: ReactNode;
  title: string;
  icon?: string;
  showBack?: boolean;
}

export function WindowFrame({
  children,
  title,
  icon = "🏆",
  showBack = false,
}: WindowFrameProps) {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
        {/* Window Header */}
        <div className="bg-gray-100 border-b px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Traffic Light Buttons */}
            <div className="flex gap-2">
              {showBack ? (
                <button
                  onClick={() => router.back()}
                  className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 flex items-center justify-center text-[8px]"
                >
                  ←
                </button>
              ) : (
                <div className="w-3 h-3 rounded-full bg-red-400" />
              )}
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>

            {/* Title */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{icon}</span>
              <span className="font-medium">{title}</span>
            </div>
          </div>

          {/* User Area */}
          <div>
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:bg-gray-200 rounded-lg px-2 py-1 transition-colors">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={session.user?.image || ""} />
                      <AvatarFallback>
                        {session.user?.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">
                      {session.user?.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/mypage">마이페이지</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signIn("github")}
                className="text-sm"
              >
                로그인
              </Button>
            )}
          </div>
        </div>

        {/* Window Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
