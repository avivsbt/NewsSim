import { useState } from 'react';
import '../App.css';
import type { Language } from '../types/NewsItem';
import { useFetchNews } from '../hooks/useFetchNews';
import { getSimilarityScore, toPercentage } from '../utils/articleUtils';
import { DEFAULT_LANGUAGE, DEFAULT_SIMILARITY_THRESHOLD } from '../constants';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ArticleCard from '../components/ArticleCard';

function SimilarityViewer() {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(
    DEFAULT_SIMILARITY_THRESHOLD
  );

  const { articles, loading, error, refetch } = useFetchNews(language);

  // Reset selection and threshold when language changes
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setSelectedArticle(null);
    setSimilarityThreshold(DEFAULT_SIMILARITY_THRESHOLD);
  };

  const getFilteredArticles = () => {
    if (!selectedArticle) return articles;

    const selectedArticleData = articles.find((a) => a.id === selectedArticle);
    if (!selectedArticleData) {
      return [];
    }

    const similarArticles = articles
      .filter((article) => article.id !== selectedArticle)
      .map((article) => {
        const score = getSimilarityScore(articles, selectedArticle, article.id);
        return { ...article, currentSimilarity: score };
      })
      .filter((article) => article.currentSimilarity >= similarityThreshold)
      .sort((a, b) => b.currentSimilarity - a.currentSimilarity);

    // Return selected article first, then similar articles sorted by score
    return [selectedArticleData, ...similarArticles];
  };

  const getSimilarArticlesCount = (): number => {
    if (!selectedArticle) return 0;
    return articles.filter(
      (article) =>
        article.id !== selectedArticle &&
        getSimilarityScore(articles, selectedArticle, article.id) >= similarityThreshold
    ).length;
  };

  const handleArticleClick = (articleId: string) => {
    setSelectedArticle(selectedArticle === articleId ? null : articleId);
  };

  const filteredArticles = getFilteredArticles();

  return (
    <div className="app-container">
      <PageHeader
        icon="📰"
        title="Similarity Viewer"
        subtitle="Analyze and compare news articles to detect similarity patterns"
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      <main className="main-content">
        <section className="demo-section">
          <div className="section-header">
            <h2 className="section-title">Top News Articles</h2>
            {selectedArticle && (
              <div className="selection-controls">
                <div className="selection-info">
                  <span className="selection-icon">✓</span>
                  <span>1 article selected</span>
                  <span className="separator">•</span>
                  <span className="similar-count">
                    {getSimilarArticlesCount()} similar articles found
                  </span>
                  <button
                    className="clear-selection-btn"
                    onClick={() => setSelectedArticle(null)}
                  >
                    Clear Selection
                  </button>
                </div>
                <div className="similarity-filter">
                  <label htmlFor="similarity-range">
                    <span className="filter-label">Similarity Threshold:</span>
                    <span className="filter-value">
                      {toPercentage(similarityThreshold)}
                    </span>
                  </label>
                  <div className="slider-container">
                    <input
                      id="similarity-range"
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={similarityThreshold}
                      onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                      className="similarity-slider"
                      title={`Current: ${toPercentage(similarityThreshold, 1)}`}
                    />
                  </div>
                  <div className="range-labels">
                    <span>
                      0%<br />
                      <small>(All)</small>
                    </span>
                    <span>
                      50%<br />
                      <small>(Medium)</small>
                    </span>
                    <span>
                      100%<br />
                      <small>(Exact)</small>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {loading && <LoadingSpinner />}

          {error && <ErrorMessage message={error} onRetry={refetch} />}

          {!loading && !error && articles.length === 0 && (
            <div className="empty-state">
              <p>No articles found.</p>
            </div>
          )}

          {!loading && !error && articles.length > 0 && (
            <>
              {selectedArticle && (
                <div className="similar-articles-section">
                  <div className="similar-header">
                    <h3>📊 Similarity Analysis</h3>
                    <p className="similar-description">
                      Showing articles with ≥{toPercentage(similarityThreshold)} similarity
                    </p>
                  </div>
                </div>
              )}

              <div className="articles-grid">
                {filteredArticles.length === 0 && selectedArticle && (
                  <div className="no-similar-articles">
                    <p>😕 No similar articles found at this threshold</p>
                    <p className="suggestion">
                      Try lowering the similarity threshold to find more matches
                    </p>
                  </div>
                )}
                {filteredArticles.map((article) => {
                  const similarityScore =
                    selectedArticle && article.id !== selectedArticle
                      ? getSimilarityScore(articles, selectedArticle, article.id)
                      : null;

                  const isSelected = selectedArticle === article.id;

                  return (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      isSelected={isSelected}
                      similarityScore={similarityScore}
                      onClick={() => handleArticleClick(article.id)}
                    />
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>Magnum</p>
      </footer>
    </div>
  );
}

export default SimilarityViewer;
