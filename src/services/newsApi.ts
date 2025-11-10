import type { NewsItem, Language } from '../types';
import { API_BASE_URL, ERROR_MESSAGES } from '../constants';

export async function getTopNewsItems(language: Language = 'en', signal?: AbortSignal): Promise<NewsItem[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/getTopNewsItems?language=${language}`,
      { signal }
    );

    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.HTTP_ERROR(response.status));
    }

    const data = await response.json() as unknown[];
    
    if (!Array.isArray(data)) {
      throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
    }
    
    return data.map((item: unknown): NewsItem => {
      const rawItem = item as Record<string, unknown>;
      return {
        id: String(rawItem.id || ''),
        title: String(rawItem.title || 'Untitled'),
        publisher_name: String(rawItem.publisher_name || 'Unknown'),
        publish_date: String(rawItem.publish_date || new Date().toISOString()),
        thumbnail_url: String(rawItem.thumbnail_url || ''),
        url: String(rawItem.url || '#'),
        similarity_map: (rawItem.similarity_map as Record<string, number>) || {}
      };
    });
  } catch (error) {
    console.error('Error fetching news items:', error);
    throw error;
  }
}

