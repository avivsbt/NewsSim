import { useState, useEffect } from 'react'
import './App.css'
import type { NewsItem, Language } from './types/NewsItem'
import { getTopNewsItems } from './services/newsApi'

function App() {
  const [articles, setArticles] = useState<NewsItem[]>([])
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null)
  const [language, setLanguage] = useState<Language>('en')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  // Similarity threshold: decimal format 0.0-1.0 (e.g., 0.5 = 50%, 0.75 = 75%)
  // This matches the similarity_map values which are also in decimal format
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(0)

  useEffect(() => {
    // Reset selection and threshold when language changes
    setSelectedArticle(null)
    setSimilarityThreshold(0)
    
    const abortController = new AbortController()
    fetchNewsItems(abortController.signal)
    
    return () => abortController.abort()
  }, [language])

  const fetchNewsItems = async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTopNewsItems(language, signal)
      setArticles(data)
    } catch (err) {
      if (signal?.aborted) return
      setError('Failed to fetch news items. Please try again later.')
      console.error(err)
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const getSimilarityScore = (selectedId: string, targetId: string): number => {
    const selectedArticle = articles.find(a => a.id === selectedId)
    
    if (!selectedArticle?.similarity_map) {
      return 0
    }
    
    const simMap = selectedArticle.similarity_map as any
    const score = simMap[targetId]
    
    return (score !== undefined && score !== null && typeof score === 'number') ? score : 0
  }

  const getFilteredArticles = (): NewsItem[] => {
    if (!selectedArticle) return articles
    
    const selectedArticleData = articles.find(a => a.id === selectedArticle)
    if (!selectedArticleData) {
      return []
    }
    
    const similarArticles = articles
      .filter(article => article.id !== selectedArticle)
      .map((article) => {
        const score = getSimilarityScore(selectedArticle, article.id)
        return { ...article, currentSimilarity: score }
      })
      .filter(article => article.currentSimilarity >= similarityThreshold)
      .sort((a, b) => b.currentSimilarity - a.currentSimilarity)
    
    // Return selected article first, then similar articles sorted by score
    return [selectedArticleData, ...similarArticles]
  }

  const getSimilarArticlesCount = (): number => {
    if (!selectedArticle) return 0
    return articles.filter(article => 
      article.id !== selectedArticle && getSimilarityScore(selectedArticle, article.id) >= similarityThreshold
    ).length
  }

  const filteredArticles = getFilteredArticles()

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="title-icon">📰</span>
            News Similarity Engine
          </h1>
          <p className="app-subtitle">
            Analyze and compare news articles to detect similarity patterns
          </p>
          <div className="language-selector">
            <button
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              English
            </button>
            <button
              className={`lang-btn ${language === 'he' ? 'active' : ''}`}
              onClick={() => setLanguage('he')}
            >
              עברית
            </button>
          </div>
        </div>
      </header>

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
                  <span className="similar-count">{getSimilarArticlesCount()} similar articles found</span>
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
                    <span className="filter-value">{(similarityThreshold * 100).toFixed(0)}%</span>
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
                      title={`Current: ${(similarityThreshold * 100).toFixed(1)}%`}
                    />
                  </div>
                  <div className="range-labels">
                    <span>0%<br/><small>(All)</small></span>
                    <span>50%<br/><small>(Medium)</small></span>
                    <span>100%<br/><small>(Exact)</small></span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading news articles...</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button onClick={() => fetchNewsItems()} className="retry-btn">
                Retry
              </button>
            </div>
          )}

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
                      Showing articles with ≥{(similarityThreshold * 100).toFixed(0)}% similarity
                    </p>
                  </div>
                </div>
              )}
              
              <div className="articles-grid">
              {filteredArticles.length === 0 && selectedArticle && (
                <div className="no-similar-articles">
                  <p>😕 No similar articles found at this threshold</p>
                  <p className="suggestion">Try lowering the similarity threshold to find more matches</p>
                </div>
              )}
              {filteredArticles.map((article) => {
                const similarityScore = selectedArticle && article.id !== selectedArticle 
                  ? getSimilarityScore(selectedArticle, article.id) 
                  : null
                
                const isSelected = selectedArticle === article.id
                
                return (
                <div
                  key={article.id}
                  className={`article-card ${isSelected ? 'selected' : 'similar'}`}
                  onClick={() => setSelectedArticle(isSelected ? null : article.id)}
                >
                  {selectedArticle === article.id && (
                    <div className="selected-badge">
                      ✓ Selected
                    </div>
                  )}
                  {similarityScore !== null && (
                    <div className="similarity-badge">
                      {(similarityScore * 100).toFixed(1)}% Match
                    </div>
                  )}
                  <div className="article-image">
                    <img 
                      src={article.thumbnail_url && article.thumbnail_url.trim() !== '' 
                        ? article.thumbnail_url 
                        : 'https://ito-group.com/wp-content/uploads/2025/04/no-image.jpg'
                      } 
                      alt={article.title}
                      onError={(e) => {
                        e.currentTarget.src = 'https://ito-group.com/wp-content/uploads/2025/04/no-image.jpg';
                      }}
                    />
                  </div>
                  <div className="article-content">
                    <div className="article-header">
                      <span className="article-source">{article.publisher_name}</span>
                      <span className="article-date">{formatDate(article.publish_date)}</span>
                    </div>
                    <h3 className="article-title">{article.title}</h3>
                    <div className="article-footer">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="read-more-btn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Read Article →
                      </a>
                    </div>
                  </div>
                </div>
                )
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
  )
}

export default App
