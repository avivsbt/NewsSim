export interface NewsItem {
  id: string;
  title: string;
  publisher_name: string;
  publish_date: string;
  thumbnail_url: string;
  url: string;
  similarity_map: { [key: string]: number }; // Object with article IDs as keys
}

export interface RawNewsItem {
  id?: string | number;
  title?: string;
  publisher_name?: string;
  publish_date?: string;
  thumbnail_url?: string;
  url?: string;
  similarity_map?: Record<string, number>;
}

export type Language = 'en' | 'he';

