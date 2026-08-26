import type { ContentSource } from "./types";

type Props = {
  previousContent?: ContentSource;
  nextContent?: ContentSource;
  language: "bn" | "en";
  onSelect: (content: ContentSource) => void;
};

function CourseTopicNavigation({ previousContent, nextContent, language, onSelect }: Props) {
  return (
    <nav className="topic-navigation" aria-label="Topic navigation">
      <button
        type="button"
        className="topic-navigation-button previous"
        onClick={() => previousContent && onSelect(previousContent)}
        disabled={!previousContent}
        aria-label={language === "bn" ? "আগের টপিক" : "Previous Topic"}
      >
        <span className="topic-navigation-arrow" aria-hidden="true">←</span>
        <span>{language === "bn" ? "আগের টপিক" : "Previous Topic"}</span>
      </button>
      <button
        type="button"
        className="topic-navigation-button next"
        onClick={() => nextContent && onSelect(nextContent)}
        disabled={!nextContent}
        aria-label={language === "bn" ? "পরের টপিক" : "Next Topic"}
      >
        <span>{language === "bn" ? "পরের টপিক" : "Next Topic"}</span>
        <span className="topic-navigation-arrow" aria-hidden="true">→</span>
      </button>
    </nav>
  );
}

export default CourseTopicNavigation;
