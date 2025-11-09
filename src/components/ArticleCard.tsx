import type { NewsItem } from '../types/NewsItem';
import { formatDate, toPercentage } from '../utils/articleUtils';
import { PLACEHOLDER_IMAGE_URL } from '../constants';

interface ArticleCardProps {
  article: NewsItem;
  isSelected?: boolean;
  similarityScore?: number | null;
  duplicateCount?: number;
  maxSimilarity?: number;
  onDuplicatesRender?: () => React.ReactNode;
  onClick?: () => void;
}

function ArticleCard({
  article,
  isSelected = false,
  similarityScore = null,
  duplicateCount = 0,
  maxSimilarity,
  onDuplicatesRender,
  onClick,
}: ArticleCardProps) {
  const hasDuplicates = duplicateCount > 0;

  return (
    <div
      className={`article-card ${isSelected ? 'selected' : ''} ${
        hasDuplicates ? 'has-duplicates' : ''
      }`}
      onClick={onClick}
    >
      {/* Selected Badge */}
      {isSelected && <div className="selected-badge">✓ Selected</div>}

      {/* Similarity Badge */}
      {similarityScore !== null && (
        <div className="similarity-badge">
          {toPercentage(similarityScore, 1)} Match
        </div>
      )}

      {/* Duplicates Badge */}
      {hasDuplicates && (
        <div className="duplicates-badge">
          🔗 {duplicateCount} duplicate{duplicateCount > 1 ? 's' : ''} removed
          <br />
          {maxSimilarity !== undefined && (
            <small>Max: {toPercentage(maxSimilarity, 1)}</small>
          )}
        </div>
      )}

      {/* Article Image */}
      <div className="article-image">
        <img
          src={
            article.thumbnail_url && article.thumbnail_url.trim() !== ''
              ? article.thumbnail_url
              : PLACEHOLDER_IMAGE_URL
          }
          alt={article.title}
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_IMAGE_URL;
          }}
        />
      </div>

      {/* Article Content */}
      <div className="article-content">
        <div className="article-header">
          <span className="article-source">{article.publisher_name}</span>
          <span className="article-date">{formatDate(article.publish_date)}</span>
        </div>
        <h3 className="article-title">{article.title}</h3>

        {/* Custom duplicates section (for Deduplicator page) */}
        {onDuplicatesRender && onDuplicatesRender()}

        {/* Footer with Read Article link */}
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
  );
}

export default ArticleCard;

