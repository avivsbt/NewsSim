# News Similarity Engine - Routing Guide

## Overview
The application now has two main routes with distinct functionalities:

## Routes

### 1. Similarity Viewer (`/`)
**Purpose**: Analyze and compare individual news articles to detect similarity patterns

**Features**:
- Select any article to see its similarity with other articles
- Adjust similarity threshold (0-100%) to filter results
- View detailed similarity scores for each article pair
- Real-time filtering based on threshold
- Visual indicators for selected and similar articles

**Use Case**: When you want to explore the similarity network around a specific article

---

### 2. Deduplicator (`/deduplicator`)
**Purpose**: Remove duplicate news articles based on a global similarity threshold

**Features**:
- Set a global threshold to identify duplicates across all articles
- Automatic deduplication algorithm that keeps one representative from each cluster
- Statistics showing:
  - Total articles loaded
  - Unique articles remaining
  - Number of duplicates removed
- Each unique article shows how many duplicates were removed
- Expandable list to view all removed duplicates with their similarity scores

**Use Case**: When you want to create a clean list without duplicate content

---

## How the Deduplicator Works

### Algorithm
1. **Load Articles**: Fetches all news articles from the API
2. **Set Threshold**: User adjusts the similarity threshold (default: 50%)
3. **Process Articles**:
   - Iterate through all articles
   - For each article, find all others with similarity ≥ threshold
   - Mark those as duplicates and keep only the first one
   - Track which articles were removed as duplicates
4. **Display Results**: Show unique articles with badges indicating removed duplicates

### Key Differences from Similarity Viewer

| Feature | Similarity Viewer | Deduplicator |
|---------|------------------|--------------|
| Selection | One article at a time | Automatic processing |
| Comparison | Selected vs. all others | All vs. all |
| Result | Filtered view of similar articles | Unique list with duplicates removed |
| Threshold | Per-article similarity filter | Global deduplication threshold |
| Use Case | Exploration & analysis | Data cleaning & uniqueness |

---

## Navigation
- Top navigation bar allows switching between routes
- Language selection (English/Hebrew) is available on both pages
- Each page maintains its own state independently

---

## Technical Implementation

### File Structure
```
src/
├── App.tsx                      # Router setup
├── App.css                      # Shared styles
├── components/
│   ├── Navigation.tsx           # Top navigation bar
│   └── Navigation.css           # Navigation styles
├── pages/
│   ├── SimilarityViewer.tsx    # Original comparison tool
│   └── Deduplicator.tsx        # New deduplication tool
├── services/
│   └── newsApi.ts              # API calls
└── types/
    └── NewsItem.ts             # TypeScript interfaces
```

### State Management
- Each page manages its own state independently
- Language changes trigger API refetch
- No shared state between routes (clean separation)

---

## Future Enhancements
- Export deduplicated list as CSV/JSON
- Batch operations (select multiple articles to keep/remove)
- Advanced clustering algorithms
- Similarity visualization graphs
- History/undo functionality

