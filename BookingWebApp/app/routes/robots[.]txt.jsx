import { json } from "@remix-run/node";

export const loader = () => {
  const lines = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /api",
    "Disallow: /user",
    "Sitemap: https://hausoflewks.com/sitemap.xml",
  ];

  return new Response(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};

export default function Robots() {
  return null;
}


