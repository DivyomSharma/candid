import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Candor",
    short_name: "Candor",
    description: "No swipes. Just honest conversations.",
    start_url: "/candor",
    display: "standalone",
    background_color: "#171311",
    theme_color: "#171311",
    icons: [
      {
        src: "/favicon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
