import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  const location = useLocation()
  
  return (
    <nav className="main-navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <span className="brand-icon">📰</span>
          <span className="brand-text">News Similarity Engine</span>
        </div>
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            Similarity Viewer
          </Link>
          <Link 
            to="/deduplicator" 
            className={`nav-link ${location.pathname === '/deduplicator' ? 'active' : ''}`}
          >
            <span className="nav-icon">🔍</span>
            Deduplicator
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navigation

