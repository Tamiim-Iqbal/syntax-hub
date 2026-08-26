import type { CSSProperties } from "react";
import type { CourseLanguage } from "../../types/course";

type Props = {
  languages: CourseLanguage[];
  selectedLanguageId?: string;
  onSelect: (language: CourseLanguage) => void;
};

function CourseLanguageSelector({ languages, selectedLanguageId, onSelect }: Props) {
  if (languages.length === 0) return null;

  return (
    <div className="course-language-bar" aria-label="Programming language selector">
      <div className="language-selector" role="group" aria-label="Select programming language">
        {languages.map((language) => (
          <button
            type="button"
            key={language.id}
            className={`language-button ${selectedLanguageId === language.id ? "active" : ""}`}
            style={{ "--language-color": language.color } as CSSProperties}
            onClick={() => onSelect(language)}
            aria-pressed={selectedLanguageId === language.id}
          >
            {language.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CourseLanguageSelector;
