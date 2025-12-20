/**
 * Utility functions for sitemap refresh and search engine notification
 */

/**
 * Ping search engines to notify them of sitemap updates
 * @param {string} sitemapUrl - Full URL to the sitemap
 */
export const pingSearchEngines = async (sitemapUrl) => {
  if (typeof window === 'undefined') return;

  // Only ping in production
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return;
  }

  const searchEngines = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    // Add Bing when ready: `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  ];

  // Ping all search engines in parallel (fire and forget)
  searchEngines.forEach(async (url) => {
    try {
      await fetch(url, { method: 'GET', mode: 'no-cors' });
    } catch (error) {
      // Silently fail - ping is best effort
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.warn('Failed to ping search engine:', url);
      }
    }
  });
};

/**
 * Fetch the sitemap to trigger regeneration (helps with CDN caching)
 * @returns {Promise<void>}
 */
export const refreshSitemap = async () => {
  try {
    await fetch('/sitemap.xml', { 
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    // Ping search engines after successful fetch
    const sitemapUrl = window.location.origin + '/sitemap.xml';
    await pingSearchEngines(sitemapUrl);
  } catch (error) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.error('Error refreshing sitemap:', error);
    }
    throw error;
  }
};

/**
 * Schedule a sitemap refresh after a delay
 * @param {number} delayMs - Delay in milliseconds before refreshing
 * @returns {number} - Timeout ID (can be used to clear the timeout)
 */
export const scheduleSitemapRefresh = (delayMs = 24 * 60 * 60 * 1000) => {
  if (typeof window === 'undefined') return null;

  return setTimeout(() => {
    refreshSitemap().catch(() => {
      // Error already logged in refreshSitemap
    });
  }, delayMs);
};

/**
 * Store sitemap refresh schedule in localStorage and set up refresh
 * This should be called when a blog post is published/updated
 */
export const setupSitemapRefreshSchedule = () => {
  if (typeof window === 'undefined') return null;

  const publishTime = Date.now();
  const refreshDelay = 24 * 60 * 60 * 1000; // 24 hours
  const scheduledRefreshTime = publishTime + refreshDelay;

  // Store in localStorage for persistence across page reloads
  localStorage.setItem('lastBlogPublishTime', publishTime.toString());
  localStorage.setItem('scheduledSitemapRefresh', scheduledRefreshTime.toString());

  // Immediate refresh for initial indexing
  refreshSitemap().catch(() => {
    // Error already logged
  });

  // Schedule delayed refresh
  return scheduleSitemapRefresh(refreshDelay);
};

/**
 * Check if a scheduled sitemap refresh is due and execute it
 * This should be called on app initialization (e.g., in root.jsx)
 */
export const checkAndExecuteScheduledRefresh = () => {
  if (typeof window === 'undefined') return;

  try {
    const scheduledRefreshTime = localStorage.getItem('scheduledSitemapRefresh');
    if (!scheduledRefreshTime) return;

    const refreshTime = parseInt(scheduledRefreshTime, 10);
    const now = Date.now();

    if (now >= refreshTime) {
      // Time to refresh
      refreshSitemap()
        .then(() => {
          localStorage.removeItem('scheduledSitemapRefresh');
          localStorage.removeItem('lastBlogPublishTime');
        })
        .catch(() => {
          // Error already logged
        });
    }
  } catch (error) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.error('Error checking scheduled sitemap refresh:', error);
    }
  }
};

