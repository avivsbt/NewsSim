import { useState, useEffect } from 'react';
import '../App.css';
import type { NewsItem, Language } from '../types';
import { useFetchNews } from '../hooks/useFetchNews';
import { getArticleById, toPercentage } from '../utils/articleUtils';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_DEDUPLICATION_THRESHOLD,
} from '../constants';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ArticleCard from '../components/ArticleCard';

interface ArticleWithSimilarities extends NewsItem {
  duplicates: string[];
  maxSimilarity: number;
}

function Deduplicator() {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [threshold, setThreshold] = useState<number>(DEFAULT_DEDUPLICATION_THRESHOLD);
  const [deduplicatedArticles, setDeduplicatedArticles] = useState<
    ArticleWithSimilarities[]
  >([]);
  const [removedCount, setRemovedCount] = useState<number>(0);

  const { articles, loading, error, refetch } = useFetchNews(language);

  useEffect(() => {
    if (articles.length > 0) {
      deduplicateArticles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles, threshold]);

  const deduplicateArticles = () => {
    const processed = new Set<string>();
    const result: ArticleWithSimilarities[] = [];

    articles.forEach((article) => {
      if (processed.has(article.id)) return;

      const duplicates: string[] = [];
      let maxSimilarity = 0;

      // Find all duplicates of this article
      articles.forEach((otherArticle) => {
        if (article.id === otherArticle.id || processed.has(otherArticle.id))
          return;

        const similarity = article.similarity_map[otherArticle.id] ?? 0;

        if (similarity >= threshold) {
          duplicates.push(otherArticle.id);
          processed.add(otherArticle.id);
          maxSimilarity = Math.max(maxSimilarity, similarity);
        }
      });

      result.push({
        ...article,
        duplicates,
        maxSimilarity,
      });
      processed.add(article.id);
    });

    setDeduplicatedArticles(result);
    setRemovedCount(articles.length - result.length);
  };

  const renderDuplicatesSection = (article: ArticleWithSimilarities) => {
    if (article.duplicates.length === 0) return null;

    return (
      <details className="duplicates-details">
        <summary>View removed duplicates ({article.duplicates.length})</summary>
        <div className="duplicates-list">
          {article.duplicates.map((dupId) => {
            const dupArticle = getArticleById(articles, dupId);
            if (!dupArticle) return null;
            const similarity = article.similarity_map[dupId] ?? 0;

            return (
              <div key={dupId} className="duplicate-item">
                <div className="duplicate-similarity">
                  {toPercentage(similarity, 1)}
                </div>
                <div className="duplicate-info">
                  <div className="duplicate-title">{dupArticle.title}</div>
                  <div className="duplicate-source">{dupArticle.publisher_name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </details>
    );
  };

  return (
    <div className="app-container">
      <PageHeader
        icon="🔍"
        title="News Deduplicator"
        subtitle="Remove duplicate news articles based on similarity threshold"
        language={language}
        onLanguageChange={setLanguage}
      />

      <main className="main-content">
        <section className="demo-section">
          <div className="section-header">
            <h2 className="section-title">Deduplication Results</h2>
            <div className="dedup-controls">
              <div className="dedup-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Articles:</span>
                  <span className="stat-value">{articles.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Unique Articles:</span>
                  <span className="stat-value unique">
                    {deduplicatedArticles.length}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Duplicates Removed:</span>
                  <span className="stat-value removed">{removedCount}</span>
                </div>
              </div>

              <div className="similarity-filter">
                <label htmlFor="threshold-range">
                  <span className="filter-label">Similarity Threshold:</span>
                  <span className="filter-value">{toPercentage(threshold)}</span>
                </label>
                <div className="slider-container">
                  <input
                    id="threshold-range"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    className="similarity-slider"
                    title={`Current: ${toPercentage(threshold, 1)}`}
                  />
                </div>
                <div className="range-labels">
                  <span>
                    0%<br />
                    <small>(Very Loose)</small>
                  </span>
                  <span>
                    50%<br />
                    <small>(Moderate)</small>
                  </span>
                  <span>
                    100%<br />
                    <small>(Exact)</small>
                  </span>
                </div>
                <p className="threshold-hint">
                  Articles with similarity ≥ {toPercentage(threshold)} are considered
                  duplicates
                </p>
              </div>
            </div>
          </div>

          {loading && <LoadingSpinner />}

          {error && <ErrorMessage message={error} onRetry={refetch} />}

          {!loading && !error && articles.length === 0 && (
            <div className="empty-state">
              <p>No articles found.</p>
            </div>
          )}

          {!loading && !error && deduplicatedArticles.length > 0 && (
            <div className="articles-grid">
              {deduplicatedArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  duplicateCount={article.duplicates.length}
                  maxSimilarity={article.maxSimilarity}
                  onDuplicatesRender={() => renderDuplicatesSection(article)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>Magnum</p>
      </footer>
    </div>
  );
}

export default Deduplicator;
