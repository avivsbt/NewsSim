import { useState, useEffect } from 'react'
import '../App.css'
import type { NewsItem, Language } from '../types/NewsItem'
import { getTopNewsItems } from '../services/newsApi'

interface ArticleWithSimilarities extends NewsItem {
  duplicates: string[]
  maxSimilarity: number
}

function Deduplicator() {
  const [articles, setArticles] = useState<NewsItem[]>([])
  const [language, setLanguage] = useState<Language>('en')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [threshold, setThreshold] = useState<number>(0.5) // Default 50%
  const [deduplicatedArticles, setDeduplicatedArticles] = useState<ArticleWithSimilarities[]>([])
  const [removedCount, setRemovedCount] = useState<number>(0)

  useEffect(() => {
    const abortController = new AbortController()
    fetchNewsItems(abortController.signal)
    
    return () => abortController.abort()
  }, [language])

  useEffect(() => {
    if (articles.length > 0) {
      deduplicateArticles()
    }
  }, [articles, threshold])

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

  const deduplicateArticles = () => {
    const processed = new Set<string>()
    const result: ArticleWithSimilarities[] = []
    
    articles.forEach(article => {
      if (processed.has(article.id)) return
      
      const duplicates: string[] = []
      let maxSimilarity = 0
      
      // Find all duplicates of this article
      articles.forEach(otherArticle => {
        if (article.id === otherArticle.id || processed.has(otherArticle.id)) return
        
        const simMap = article.similarity_map as { [key: string]: number }
        const similarity = simMap?.[otherArticle.id] ?? 0
        
        if (similarity >= threshold) {
          duplicates.push(otherArticle.id)
          processed.add(otherArticle.id)
          maxSimilarity = Math.max(maxSimilarity, similarity)
        }
      })
      
      result.push({
        ...article,
        duplicates,
        maxSimilarity
      })
      processed.add(article.id)
    })
    
    setDeduplicatedArticles(result)
    setRemovedCount(articles.length - result.length)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const getArticleById = (id: string): NewsItem | undefined => {
    return articles.find(a => a.id === id)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="title-icon">🔍</span>
            News Deduplicator
          </h1>
          <p className="app-subtitle">
            Remove duplicate news articles based on similarity threshold
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
            <h2 className="section-title">Deduplication Results</h2>
            <div className="dedup-controls">
              <div className="dedup-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Articles:</span>
                  <span className="stat-value">{articles.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Unique Articles:</span>
                  <span className="stat-value unique">{deduplicatedArticles.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Duplicates Removed:</span>
                  <span className="stat-value removed">{removedCount}</span>
                </div>
              </div>
              
              <div className="similarity-filter">
                <label htmlFor="threshold-range">
                  <span className="filter-label">Similarity Threshold:</span>
                  <span className="filter-value">{(threshold * 100).toFixed(0)}%</span>
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
                    title={`Current: ${(threshold * 100).toFixed(1)}%`}
                  />
                </div>
                <div className="range-labels">
                  <span>0%<br/><small>(Very Loose)</small></span>
                  <span>50%<br/><small>(Moderate)</small></span>
                  <span>100%<br/><small>(Exact)</small></span>
                </div>
                <p className="threshold-hint">
                  Articles with similarity ≥ {(threshold * 100).toFixed(0)}% are considered duplicates
                </p>
              </div>
            </div>
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

          {!loading && !error && deduplicatedArticles.length > 0 && (
            <div className="articles-grid">
              {deduplicatedArticles.map((article) => (
                <div
                  key={article.id}
                  className={`article-card ${article.duplicates.length > 0 ? 'has-duplicates' : ''}`}
                >
                  {article.duplicates.length > 0 && (
                    <div className="duplicates-badge">
                      🔗 {article.duplicates.length} duplicate{article.duplicates.length > 1 ? 's' : ''} removed
                      <br />
                      <small>Max: {(article.maxSimilarity * 100).toFixed(1)}%</small>
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
                    
                    {article.duplicates.length > 0 && (
                      <details className="duplicates-details">
                        <summary>View removed duplicates ({article.duplicates.length})</summary>
                        <div className="duplicates-list">
                          {article.duplicates.map(dupId => {
                            const dupArticle = getArticleById(dupId)
                            if (!dupArticle) return null
                            const simMap = article.similarity_map as { [key: string]: number }
                            const similarity = simMap?.[dupId] ?? 0
                            
                            return (
                              <div key={dupId} className="duplicate-item">
                                <div className="duplicate-similarity">
                                  {(similarity * 100).toFixed(1)}%
                                </div>
                                <div className="duplicate-info">
                                  <div className="duplicate-title">{dupArticle.title}</div>
                                  <div className="duplicate-source">{dupArticle.publisher_name}</div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </details>
                    )}
                    
                    <div className="article-footer">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="read-more-btn"
                      >
                        Read Article →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>Magnum</p>
      </footer>
    </div>
  )
}

export default Deduplicator

