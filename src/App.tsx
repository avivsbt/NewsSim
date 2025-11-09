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

  useEffect(() => {
    fetchNewsItems()
  }, [language])

  const fetchNewsItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTopNewsItems(language)
      setArticles(data)
    } catch (err) {
      setError('Failed to fetch news items. Please try again later.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="title-icon">📰</span>
            NewsSimilarityEngine
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
              <div className="selection-info">
                <span className="selection-icon">✓</span>
                <span>1 article selected</span>
                <button 
                  className="clear-selection-btn"
                  onClick={() => setSelectedArticle(null)}
                >
                  Clear Selection
                </button>
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
              <button onClick={fetchNewsItems} className="retry-btn">
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
            <div className="articles-grid">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className={`article-card ${selectedArticle === article.id ? 'selected' : ''}`}
                  onClick={() => setSelectedArticle(selectedArticle === article.id ? null : article.id)}
                >
                  {selectedArticle === article.id && (
                    <div className="selected-badge">
                      ✓ Selected
                    </div>
                  )}
                  {article.thumbnail_url && (
                    <div className="article-image">
                      <img src={article.thumbnail_url} alt={article.title} />
                    </div>
                  )}
                  <div className="article-content">
                    <div className="article-header">
                      <span className="article-source">{article.publisher_name}</span>
                      <span className="article-date">{formatDate(article.publish_date)}</span>
                    </div>
                    <h3 className="article-title">{article.title}</h3>
                    {article.similarity_map && article.similarity_map.length > 0 && (
                      <div className="similarity-info">
                        <span className="similarity-label">Similarities:</span>
                        <span className="similarity-count">{article.similarity_map.length}</span>
                      </div>
                    )}
                    <div className="article-footer">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="read-more-btn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Read Article
                      </a>
                      <button className="analyze-btn">
                        Analyze Similarity
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Upload your news articles and discover hidden connections</p>
            <button className="cta-button">Upload Articles</button>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>Built with React + TypeScript + Vite</p>
      </footer>
    </div>
  )
}

export default App
