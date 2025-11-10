import { useState, useEffect } from 'react';
import type { NewsItem, Language } from '../types';
import { getTopNewsItems } from '../services/newsApi';
import { ERROR_MESSAGES } from '../constants';

interface UseFetchNewsResult {
  articles: NewsItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch news articles
 */
export function useFetchNews(language: Language): UseFetchNewsResult {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchNewsItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTopNewsItems(language, abortController.signal);
        setArticles(data);
      } catch (err) {
        if (abortController.signal.aborted) return;
        setError(ERROR_MESSAGES.FETCH_FAILED);
        console.error(err);
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchNewsItems();

    return () => abortController.abort();
  }, [language, refetchTrigger]);

  const refetch = () => setRefetchTrigger((prev) => prev + 1);

  return { articles, loading, error, refetch };
}

