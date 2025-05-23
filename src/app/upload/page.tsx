"use client";
import EpubUploader from "@/components/EpubUploader";
import BackToHomeButton from "@/components/BackToHomeButton";
import { useState } from "react";

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (_file: File) => {
    console.log(_file.name);
    setUploading(true);
    setSuccess(false);
    setError("");
    try {
      // 模拟上传，后续可对接后端API或本地存储
      await new Promise((res) => setTimeout(res, 1000));
      setSuccess(true);
    } catch {
      setError("上传失败，请重试");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="p-8">
      <div className="flex items-center gap-3 mb-4">
        <BackToHomeButton />
        <h1 className="text-2xl font-bold">上传电子书</h1>
      </div>
      <EpubUploader onUpload={handleUpload} />
      {uploading && <div className="text-blue-500 mt-4">正在上传...</div>}
      {success && <div className="text-green-600 mt-4">上传成功！</div>}
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </main>
  );
}