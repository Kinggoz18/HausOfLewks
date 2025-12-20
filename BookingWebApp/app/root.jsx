import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from "@remix-run/react";
import React from "react";
import CustomNavbar from "./Components/CustomNavbar";
import appStylesHref from "./index.css?url";
import Footer from "./Components/Footer";
import { AppProvider } from "../storage/AppProvider";
import ErrorBoundary from "./Components/ErrorBoundary";
import { checkAndExecuteScheduledRefresh } from "./util/sitemapRefresh";

/*****
 * TODO:
 * 3. Secure backend admin routes
 * 4. Add rate limit to certain endpoints
 * 5. Complete the blog section
 * 7. Add custom service to the service listing
 */

export default function App() {
  const path = useLocation();
  const pathname = path.pathname;

  // Check if sitemap refresh is due (24 hours after blog publish)
  React.useEffect(() => {
    checkAndExecuteScheduledRefresh();
  }, [pathname]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="overflow-x-hidden h-screen w-screen min-w-screen min-h-screen">
        <ErrorBoundary>
          <AppProvider>
            {/* Don't show CustomNavbar on admin or booking routes (they have their own navbars) */}
            {pathname.includes("/admin") || pathname.includes("/booking") ? null : <CustomNavbar />}
            <ErrorBoundary message="An error occurred while loading the page content.">
              <Outlet />
            </ErrorBoundary>
          </AppProvider>
          {/* Don't show Footer on admin or booking routes */}
          {pathname.includes("/admin") || pathname.includes("/booking") ? null : <Footer />}
        </ErrorBoundary>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export const links = () => [{ rel: "stylesheet", href: appStylesHref }];

export const meta = () => {
  const title = "Haus of Lewks | Braids, Locs & Protective Styles in Peterborough";
  const description =
    "Book professional braids, locs, retwists and protective styles at Haus of Lewks in Peterborough, Ontario. View services, policies, and secure your appointment online.";

  return [
    { title },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
};
