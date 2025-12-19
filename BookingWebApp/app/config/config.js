// app/config.js
export function getApiUrl() {
  // Use relative URL when in production (same origin)
  // Fall back to localhost for development
  if (typeof window !== 'undefined') {
    // Client-side: use relative URL
    return "/api/v1";
  }
  // Server-side: use environment variable or default
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
