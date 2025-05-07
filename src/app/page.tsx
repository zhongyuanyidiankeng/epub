import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#18181c] p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2">我的 EPUB 图书馆</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">管理、上传和阅读你的电子书</p>
      </header>
      <main className="flex flex-col gap-8 w-full max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link href="/upload" className="rounded-lg shadow-md bg-white dark:bg-[#23232a] p-6 flex flex-col items-center hover:scale-105 transition-transform border border-gray-200 dark:border-gray-700">
            <Image src="/file.svg" alt="上传图书" width={40} height={40} />
            <span className="mt-3 font-semibold">上传图书</span>
          </Link>
          <Link href="/library" className="rounded-lg shadow-md bg-white dark:bg-[#23232a] p-6 flex flex-col items-center hover:scale-105 transition-transform border border-gray-200 dark:border-gray-700">
            <Image src="/window.svg" alt="图书馆" width={40} height={40} />
            <span className="mt-3 font-semibold">进入图书馆</span>
          </Link>
          <Link href="/reader" className="rounded-lg shadow-md bg-white dark:bg-[#23232a] p-6 flex flex-col items-center hover:scale-105 transition-transform border border-gray-200 dark:border-gray-700">
            <Image src="/globe.svg" alt="最近阅读" width={40} height={40} />
            <span className="mt-3 font-semibold">最近阅读</span>
          </Link>
        </div>
        <section className="mt-8 text-center text-gray-500 dark:text-gray-400">
          <p>欢迎使用 EPUB 图书馆！在这里你可以上传 EPUB 电子书、浏览你的图书馆并随时阅读。</p>
        </section>
      </main>
      <footer className="mt-16 text-xs text-gray-400">EPUB 图书馆 © 2024</footer>
    </div>
  );
}
