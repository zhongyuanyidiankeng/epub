import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const EPUB_DIR = path.join(process.cwd(), "public", "epubs");

export async function GET() {
  try {
    if (!fs.existsSync(EPUB_DIR)) {
      return NextResponse.json({ books: [] });
    }
    const files = fs.readdirSync(EPUB_DIR).filter(f => f.endsWith(".epub"));
    const books = files.map(filename => ({
      id: path.basename(filename, ".epub"),
      title: path.basename(filename, ".epub"),
      file: `/epubs/${filename}`
    }));
    return NextResponse.json({ books });
  } catch {
    return NextResponse.json({ error: "读取图书列表失败" }, { status: 500 });
  }
}