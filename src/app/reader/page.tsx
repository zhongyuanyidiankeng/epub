"use client";
import EpubReader from "@/components/EpubReader";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ReaderPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const [showPinyin, setShowPinyin] = useState(false);
  // 模拟文件url，后续可根据id获取实际文件
  const fileUrl = id ? `/epubs/${id}.epub` : "";

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
        <EpubReader fileUrl={fileUrl} showPinyin={showPinyin} />
      </div>
    </main>
  );
}