"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const isSyncing = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || isSyncing.current) return;
    isSyncing.current = true;

    const syncWithDotNet = async () => {
      try {
        const response = await fetch("http://localhost:5223/api/users/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            displayName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username,
            avatar: user.imageUrl,
            username: user.username || user.emailAddresses[0]?.emailAddress.split("@")[0]
          }),
        });

        if (response.ok) {
          router.push("/");
        } else {
          console.error("Backend .NET báo lỗi đồng bộ");
          router.push("/login?error=sync_failed");
        }
      } catch (err) {
        console.error("Không thể kết nối tới backend .NET", err);
        router.push("/login?error=network_error");
      }
    };

    syncWithDotNet();
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-red-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-zinc-400 text-sm font-medium">Đang khởi tạo không gian học thuật của bạn...</p>
      </div>
    </div>
  );
}