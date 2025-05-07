"use client";
import EpubReader from "@/components/EpubReader";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function ReaderContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const fileUrl = id ? `/epubs/${id}.epub` : "";
  return <EpubReader fileUrl={fileUrl} showPinyin={false} />;
}

export default function ReaderPage() {
  const [showPinyin, setShowPinyin] = useState(false);

  return (
    <main className="p-0 w-full h-screen bg-gray-50">
      <div className="flex items-center justify-between px-4 py-2 bg-white shadow">
        <h1 className="text-xl font-bold">阅读器</h1>
        <button
          className="text-blue-600 border px-3 py-1 rounded hover:bg-blue-50"
          onClick={() => setShowPinyin((v) => !v)}
        >
          {showPinyin ? "隐藏拼音" : "显示拼音"}
        </button>
      </div>
      <div className="w-full h-[calc(100vh-48px)]">
        <Suspense fallback={<div className="flex items-center justify-center h-full">加载中...</div>}>
          <ReaderContent />
        </Suspense>
      </div>
    </main>
  );
}