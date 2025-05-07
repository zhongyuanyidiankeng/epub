import React from "react";

export interface BookInfo {
  id: string;
  title: string;
  author?: string;
  coverUrl?: string;
}

interface EpubBookListProps {
  books: BookInfo[];
  onRead: (book: BookInfo) => void;
}

export default function EpubBookList({ books, onRead }: EpubBookListProps) {
  if (!books.length) {
    return <div className="text-gray-400">暂无已上传的epub图书</div>;
  }
  return (
    <ul className="space-y-4">
      {books.map((book) => (
        <li key={book.id} className="border rounded p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {book.coverUrl && (
              <img src={book.coverUrl} alt={book.title} className="w-12 h-16 object-cover rounded shadow" />
            )}
            <div>
              <div className="font-semibold">{book.title}</div>
              {book.author && <div className="text-sm text-gray-500">{book.author}</div>}
            </div>
          </div>
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            onClick={() => onRead(book)}
          >
            进入阅读器
          </button>
        </li>
      ))}
    </ul>
  );
}