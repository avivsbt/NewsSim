// API Configuration
export const API_BASE_URL = 'http://ps001.ps.fog.taboolasyndication.com:3001/api/topNewsItemsSimilarity';

// UI Constants
export const PLACEHOLDER_IMAGE_URL = 'https://ito-group.com/wp-content/uploads/2025/04/no-image.jpg';

// Default Values
export const DEFAULT_SIMILARITY_THRESHOLD = 0;
export const DEFAULT_DEDUPLICATION_THRESHOLD = 0.5;
export const DEFAULT_LANGUAGE = 'en' as const;

// Error Messages
export const ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to fetch news items. Please try again later.',
  INVALID_RESPONSE: 'Invalid response format: expected array',
  HTTP_ERROR: (status: number) => `HTTP error! status: ${status}`,
} as const;

