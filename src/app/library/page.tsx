"use client";
import { useEffect, useState } from "react";
import EpubBookList, { BookInfo } from "@/components/EpubBookList";
import { useRouter } from "next/navigation";

export default function LibraryPage() {
  const [books, setBooks] = useState<BookInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetch("/api/epubs")
      .then(res => res.json())
      .then(data => {
        setBooks(data.books || []);
        setLoading(false);
      })
      .catch(() => {
        setBooks([]);
        setLoading(false);
      });
  }, []);

  const handleRead = (book: BookInfo) => {
    router.push(`/reader?id=${book.id}`);
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">图书馆首页</h1>
      <div>
        {loading ? (
          <div className="text-gray-500">正在加载图书列表...</div>
        ) : (
          <EpubBookList books={books} onRead={handleRead} />
        )}
      </div>
    </main>
  );
}