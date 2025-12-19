/**
 * Catch-all route for unmatched paths
 * Handles static file requests (source maps, etc.) and returns 404
 * This route matches any path that doesn't match more specific routes
 */
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Check if this looks like a static file request (source maps, assets, etc.)
  const staticFileExtensions = /\.(js|map|css|json|ts|tsx|jsx|html|xml|txt|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|webp|avif)$/i;
  
  if (staticFileExtensions.test(pathname)) {
    // Return 404 for static files - these should be served by Vite, not routed
    throw new Response(null, { status: 404 });
  }

  // For other unmatched routes, return 404
  throw new Response("Page Not Found", { status: 404 });
};

export default function CatchAll() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
}

