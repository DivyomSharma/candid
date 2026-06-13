import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
    }

    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Pexels API key not configured" }, { status: 500 });
    }

    // Pexels API fetching one highly rated photo
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=square`, {
      headers: {
        Authorization: apiKey,
      },
      next: { revalidate: 86400 } // cache for 24 hours
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from Pexels API" }, { status: res.status });
    }

    const data = await res.json();
    if (!data.photos || data.photos.length === 0) {
      return NextResponse.json({ error: "No photos found" }, { status: 404 });
    }

    const photo = data.photos[0];
    return NextResponse.json({
      imageUrl: photo.src.large2x || photo.src.large || photo.src.medium,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      alt: photo.alt,
    });
  } catch (error) {
    console.error("Pexels API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
