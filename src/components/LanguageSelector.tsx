import type { Language } from '../types/NewsItem';

interface LanguageSelectorProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

function LanguageSelector({ language, onLanguageChange }: LanguageSelectorProps) {
  return (
    <div className="language-selector">
      <button
        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
        onClick={() => onLanguageChange('en')}
      >
        English
      </button>
      <button
        className={`lang-btn ${language === 'he' ? 'active' : ''}`}
        onClick={() => onLanguageChange('he')}
      >
        עברית
      </button>
    </div>
  );
}

export default LanguageSelector;

