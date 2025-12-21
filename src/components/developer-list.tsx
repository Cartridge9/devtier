"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TierBadge } from "@/components/tier-badge";
import { Badge } from "@/components/ui/badge";

interface Developer {
  id: string;
  bio: string | null;
  githubUrl: string;
  user: {
    name: string | null;
    image: string | null;
  };
  averageScore: number;
  reviewCount: number;
}

const tierFilters = ["전체", "SSS", "S", "A", "B", "C", "D"] as const;

export function DeveloperList() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("전체");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      const res = await fetch("/api/developers");
      const data = await res.json();
      setDevelopers(data);
    } catch (error) {
      console.error("Failed to fetch developers:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTierFromScore = (score: number): string => {
    if (score >= 9.5) return "SSS";
    if (score >= 8.5) return "S";
    if (score >= 7.0) return "A";
    if (score >= 5.5) return "B";
    if (score >= 4.0) return "C";
    return "D";
  };

  const filteredDevelopers = developers.filter((dev) => {
    const matchesSearch = dev.user.name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesTier =
      tierFilter === "전체" ||
      getTierFromScore(dev.averageScore) === tierFilter;
    return matchesSearch && matchesTier;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="space-y-3">
        <Input
          placeholder="개발자 이름 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
        <div className="flex gap-2 flex-wrap">
          {tierFilters.map((tier) => (
            <Badge
              key={tier}
              variant={tierFilter === tier ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setTierFilter(tier)}
            >
              {tier}
            </Badge>
          ))}
        </div>
      </div>

      {/* Developer Cards */}
      {filteredDevelopers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {developers.length === 0
            ? "등록된 개발자가 없습니다"
            : "검색 결과가 없습니다"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredDevelopers.map((developer) => (
            <Link
              key={developer.id}
              href={`/developers/${developer.id}`}
              className="block"
            >
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={developer.user.image || ""} />
                    <AvatarFallback>
                      {developer.user.name?.[0] || "D"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {developer.user.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {developer.bio || "소개가 없습니다"}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TierBadge score={developer.averageScore} size="sm" />
                    <span className="text-sm font-medium">
                      {developer.averageScore.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    평가 {developer.reviewCount}개
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
