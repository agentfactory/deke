"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "invalid">(
    token ? "loading" : "invalid"
  );

  useEffect(() => {
    if (!token) return;

    fetch("/api/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        setStatus(res.ok ? "success" : "error");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <span className="inline-block w-12 h-0.5 bg-[#C9943A] mb-6" />
          <h1 className="font-serif text-3xl font-semibold text-white mb-4">
            {status === "loading" && "Unsubscribing..."}
            {status === "success" && "You\u2019ve been unsubscribed"}
            {status === "error" && "Something went wrong"}
            {status === "invalid" && "Invalid link"}
          </h1>
          <p className="text-[#7A8A9A] text-base leading-relaxed">
            {status === "loading" && "Just a moment."}
            {status === "success" &&
              "You\u2019ll no longer receive The Arrangement newsletter. We\u2019ll miss you."}
            {status === "error" &&
              "We couldn\u2019t process your request. Please try again or contact us directly."}
            {status === "invalid" &&
              "This unsubscribe link appears to be invalid or expired."}
          </p>
        </div>

        <a
          href="/"
          className="inline-block text-sm text-[#C9943A] hover:text-[#D4A84A] transition-colors"
        >
          Back to dekesharon.com
        </a>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
          <p className="text-[#7A8A9A]">Loading...</p>
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
