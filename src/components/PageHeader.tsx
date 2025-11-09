import type { Language } from '../types/NewsItem';
import LanguageSelector from './LanguageSelector';

interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle: string;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

function PageHeader({
  icon,
  title,
  subtitle,
  language,
  onLanguageChange,
}: PageHeaderProps) {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-title">
          <span className="title-icon">{icon}</span>
          {title}
        </h1>
        <p className="app-subtitle">{subtitle}</p>
        <LanguageSelector language={language} onLanguageChange={onLanguageChange} />
      </div>
    </header>
  );
}

export default PageHeader;

