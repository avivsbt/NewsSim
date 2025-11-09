import type { NewsItem, Language } from '../types/NewsItem';

const API_BASE_URL = 'http://ps001.ps.fog.taboolasyndication.com:3001/api/topNewsItemsSimilarity';

export async function getTopNewsItems(language: Language = 'en'): Promise<NewsItem[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/getTopNewsItems?language=${language}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching news items:', error);
    throw error;
  }
}

