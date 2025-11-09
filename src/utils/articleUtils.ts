import type { NewsItem } from '../types/NewsItem';

/**
 * Formats a date string to a localized date format
 */
export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
}

/**
 * Gets the similarity score between two articles
 */
export function getSimilarityScore(
  articles: NewsItem[],
  selectedId: string,
  targetId: string
): number {
  const selectedArticle = articles.find((a) => a.id === selectedId);

  if (!selectedArticle?.similarity_map) {
    return 0;
  }

  const score = selectedArticle.similarity_map[targetId];

  return score !== undefined && score !== null && typeof score === 'number'
    ? score
    : 0;
}

/**
 * Converts a decimal score (0-1) to percentage string
 */
export function toPercentage(score: number, decimals: number = 0): string {
  return `${(score * 100).toFixed(decimals)}%`;
}

/**
 * Gets an article by ID from an array of articles
 */
export function getArticleById(
  articles: NewsItem[],
  id: string
): NewsItem | undefined {
  return articles.find((a) => a.id === id);
}

