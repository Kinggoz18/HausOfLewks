// app/config.js
export function getApiUrl() {
  // Infrastructure is merged - frontend and API are served from the same origin
  // Client-side: use relative URL (works for both development and production with merged infrastructure)
  if (typeof window !== 'undefined') {
    return "/api/v1";
  }
  // Server-side (SSR): use environment variable or default to localhost
  // In merged infrastructure, this should match the server's base path
  return process.env.API_URL || "http://localhost:3000/api/v1";
}

/**
 * Get the URL to serve a media file from the backend
 * Uses the /media/drive/:id endpoint instead of direct Google Drive URLs
 * @param {string} driveId - The Google Drive file ID
 * @returns {string} The URL to fetch the media file
 */
export function getMediaUrl(driveId) {
  if (!driveId) return null;
  return `${getApiUrl()}/media/drive/${driveId}`;
}
