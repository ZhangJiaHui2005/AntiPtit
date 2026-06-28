"use client";

import { useState } from "react";
import { Badge }  from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Heart, MessageCircle, Clock, Flame, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  tags: string[];
  isHot?: boolean;
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

function highlight(text: string, q: string): React.ReactNode {
  if (!q.trim()) return text;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(re);
  return parts.map((p, i) =>
    re.test(p) ? (
      <mark
        key={i}
        className="bg-violet-500/20 text-violet-300 rounded px-0.5 not-italic"
      >
        {p}
      </mark>
    ) : p
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  post: Post;
  searchQuery?: string;
  onTagClick?: (tag: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PostCard({ post, searchQuery = "", onTagClick }: Props) {
  const [liked,     setLiked]     = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(v => !v);
    setLikeCount(c => liked ? c - 1 : c + 1);
  };

  return (
    <Card
      className={cn(
        "group border-[#2a2a4a] bg-[#1a1a2e] text-white",
        "hover:border-violet-600 hover:-translate-y-0.5",
        "transition-all duration-200 cursor-pointer"
      )}
    >
      <CardHeader className="pb-3">
        {/* Author row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-9 w-9 border border-[#2a2a4a]">
              {post.authorAvatar && <AvatarImage src={post.authorAvatar} />}
              <AvatarFallback
                className="text-xs font-bold text-white"
                style={{ background: stringToColor(post.authorName) }}
              >
                {post.authorName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold leading-none text-white">
                {post.authorName}
              </p>
              <p className="text-[11px] text-[#9b97c8] mt-1 flex items-center gap-1">
                <Clock size={10} />
                {timeAgo(post.createdAt)}
              </p>
            </div>
          </div>

          {post.isHot && (
            <Badge
              variant="outline"
              className="border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-bold gap-1"
            >
              <Flame size={10} /> HOT
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Title */}
        <Link href={`/posts/${post.id}`}>
          <h2 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-violet-300 transition-colors">
            {highlight(post.title, searchQuery)}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-xs text-[#9b97c8] leading-relaxed line-clamp-2 mb-3">
          {highlight(post.excerpt, searchQuery)}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map(tag => (
            <Badge
              key={tag}
              variant="outline"
              onClick={e => { e.preventDefault(); onTagClick?.(tag); }}
              className="text-[11px] border-violet-500/25 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 cursor-pointer transition-colors"
            >
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <Separator className="bg-[#2a2a4a]" />

      <CardFooter className="pt-3 flex items-center gap-4">
        {/* Like */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={cn(
            "gap-1.5 h-7 px-2 text-xs font-medium transition-colors",
            liked
              ? "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              : "text-[#9b97c8] hover:text-white hover:bg-white/5"
          )}
        >
          <Heart size={13} fill={liked ? "currentColor" : "none"} />
          {likeCount}
        </Button>

        {/* Comment */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 h-7 px-2 text-xs font-medium text-[#9b97c8] hover:text-white hover:bg-white/5"
        >
          <MessageCircle size={13} />
          {post.commentCount}
        </Button>

        {/* Read more */}
        <Button
          variant="outline"
          size="sm"
          asChild
          className="ml-auto h-7 px-3 text-xs font-semibold border-violet-500/30 bg-transparent text-violet-400 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all"
        >
          <Link href={`/posts/${post.id}`}>
            Đọc bài <ArrowRight size={11} className="ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// deterministic colour from author name
function stringToColor(str: string): string {
  const palette = ["#3b82f6","#6366f1","#10b981","#f43f5e","#f59e0b","#8b5cf6","#0ea5e9"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
} 