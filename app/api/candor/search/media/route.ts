import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const type = searchParams.get("type"); // movie, album, ebook

    if (!q || !type) {
      return NextResponse.json({ results: [] });
    }

    // --- BOOKS (OpenLibrary - Completely Free, No API Key) ---
    if (type === "ebook" || type === "book") {
      const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data.docs && data.docs.length > 0) {
          const doc = data.docs[0];
          return NextResponse.json({
            results: [{
              trackName: doc.title,
              artistName: doc.author_name?.[0],
              artworkUrl100: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : null
            }]
          });
        }
      }
    }

    // --- MOVIES (TMDB if key exists, else fallback to iTunes) ---
    if (type === "movie" && process.env.TMDB_API_KEY) {
      const res = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(q)}&include_adult=false&language=en-US&page=1`, {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          accept: 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const movie = data.results[0];
          return NextResponse.json({
            results: [{
              trackName: movie.title,
              artworkUrl100: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null
            }]
          });
        }
      }
    }

    // --- FALLBACK (iTunes for Music, and for Movies if TMDB key is missing) ---
    const itunesType = type === "book" ? "ebook" : type;
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=${itunesType}&limit=5`);
    
    if (!res.ok) {
      return NextResponse.json({ error: "iTunes API failed" }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json(json);
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
