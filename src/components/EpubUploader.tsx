import React, { useRef } from "react";

interface EpubUploaderProps {
  onUpload: (file: File) => void;
}

export default function EpubUploader({ onUpload }: EpubUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".epub")) {
      onUpload(file);
    } else {
      alert("请上传epub格式的文件");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <input
        ref={inputRef}
        type="file"
        accept=".epub"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        onClick={() => inputRef.current?.click()}
      >
        选择epub文件上传
      </button>
    </div>
  );
}