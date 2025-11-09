import type { NewsItem, Language } from '../types/NewsItem';
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

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
    }
    
    return data.map((item: any): NewsItem => ({
      id: String(item.id || ''),
      title: item.title || 'Untitled',
      publisher_name: item.publisher_name || 'Unknown',
      publish_date: item.publish_date || new Date().toISOString(),
      thumbnail_url: item.thumbnail_url || '',
      url: item.url || '#',
      similarity_map: item.similarity_map || {}
    }));
  } catch (error) {
    console.error('Error fetching news items:', error);
    throw error;
  }
}

