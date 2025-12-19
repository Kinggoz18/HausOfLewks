import { getApiUrl } from "../config/config.js";

const STATIC_ROUTES = [
  "/",
  "/blog",
  "/policy",
  "/booking/create",
  "/booking/find",
  "/showroom",
];

export const loader = async () => {
  const baseUrl = "https://hausoflewks.com";

  // Fetch published blog posts from API
  let blogRoutes = [];
  try {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/blog?published=true`);
    if (response.ok) {
      const result = await response.json();
      if (result.isSuccess && Array.isArray(result.content)) {
        blogRoutes = result.content
          .filter((post) => post.isPublished && post.slug)
          .map((post) => `/blog/${post.slug}`);
      }
    }
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error);
    // Continue with static routes if blog fetch fails
  }

  // Combine static routes with blog routes
  const allRoutes = [...STATIC_ROUTES, ...blogRoutes];

  const urls = allRoutes.map((path) => {
    const loc = `${baseUrl}${path === "/" ? "" : path}`;
    return `<url><loc>${loc}</loc></url>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
    },
  });
};

export default function SitemapXml() {
  return null;
}


