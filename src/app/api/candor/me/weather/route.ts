import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

function parseWeather(code: number) {
  if (code === 0 || code === 1) return { condition: "Clear", query: "clear sky aesthetic" };
  if (code === 2 || code === 3) return { condition: "Cloudy", query: "cloudy aesthetic" };
  if (code === 45 || code === 48) return { condition: "Foggy", query: "foggy aesthetic" };
  if (code >= 51 && code <= 67) return { condition: "Raining", query: "rainy window aesthetic" };
  if (code >= 71 && code <= 77) return { condition: "Snowing", query: "snow aesthetic" };
  if (code >= 80 && code <= 82) return { condition: "Showers", query: "rainy aesthetic" };
  if (code >= 95) return { condition: "Storming", query: "storm aesthetic" };
  return { condition: "Clear", query: "moody aesthetic" };
}

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("candor_personal_profiles")
      .select("city, lat, lon, timezone")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.lat || !profile.lon) {
      return NextResponse.json({ 
        location: profile?.city ? `Clear in ${profile.city}` : "Clear in your world", 
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        condition: "Clear",
        imageUrl: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80"
      });
    }

    // Fetch weather from open-meteo
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${profile.lat}&longitude=${profile.lon}&current_weather=true&timezone=${encodeURIComponent(profile.timezone || 'auto')}`,
      { next: { revalidate: 1800 } } // cache for 30 min
    );
    const weatherData = await weatherRes.json();
    
    const weatherCode = weatherData?.current_weather?.weathercode ?? 0;
    const { condition, query } = parseWeather(weatherCode);
    const locationStr = `${condition} in ${profile.city || 'your city'}`;

    // Get formatted time based on timezone
    let timeStr = "";
    try {
      timeStr = new Date().toLocaleTimeString('en-US', {
        timeZone: profile.timezone || undefined,
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }

    // Fetch dynamic image from Pexels
    let imageUrl = "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80"; // fallback
    const apiKey = process.env.PEXELS_API_KEY;
    if (apiKey) {
      try {
        const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
          headers: { Authorization: apiKey },
          next: { revalidate: 86400 }
        });
        const pexelsData = await pexelsRes.json();
        if (pexelsData.photos?.[0]?.src?.large) {
          imageUrl = pexelsData.photos[0].src.large;
        }
      } catch (e) {
        console.error("Pexels fetch failed in weather", e);
      }
    }

    return NextResponse.json({
      location: locationStr,
      time: timeStr,
      condition,
      imageUrl
    });
  } catch (error) {
    console.error("Weather API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
