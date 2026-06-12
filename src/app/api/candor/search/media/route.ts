import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const type = searchParams.get("type"); // movie, album, ebook

    if (!q || !type) {
      return NextResponse.json({ results: [] });
    }

    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=${type}&limit=5`);
    
    if (!res.ok) {
      return NextResponse.json({ error: "iTunes API failed" }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json(json);
  } catch (error) {
    console.error("iTunes Search Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
