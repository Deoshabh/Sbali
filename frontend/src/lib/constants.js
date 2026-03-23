/**
 * Centralized URL and site constants.
 * Import from here instead of hardcoding URLs across the codebase.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sbali.in';
export const SITE_NAME = 'Sbali';

// API base URL — for server-side fetches in sitemap, generateMetadata, etc.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.sbali.in/api/v1';

// CDN / storage base URL
export const CDN_BASE_URL =
  process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_MINIO_URL || '';

export const TWITTER_HANDLE = '@sbali_in';
