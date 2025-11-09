import type { NewsItem, Language } from '../types/NewsItem';

const API_BASE_URL = 'http://ps001.ps.fog.taboolasyndication.com:3001/api/topNewsItemsSimilarity';

export async function getTopNewsItems(language: Language = 'en', signal?: AbortSignal): Promise<NewsItem[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/getTopNewsItems?language=${language}`,
      { signal }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected array');
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

