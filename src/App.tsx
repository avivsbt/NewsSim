import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import SimilarityViewer from './pages/SimilarityViewer'
import Deduplicator from './pages/Deduplicator'
import './App.css'

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<SimilarityViewer />} />
        <Route path="/deduplicator" element={<Deduplicator />} />
      </Routes>
    </Router>
  )
}

export default App
