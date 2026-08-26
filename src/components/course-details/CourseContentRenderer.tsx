import type { ReactNode } from "react";
import CodeBlock from "../CodeBlock";
import type { ContentSection, LocalizedText, RichTextContent, CourseLanguage } from "../../types/course";
import type { ContentSource } from "./types";

const getSections = (content: ContentSource): ContentSection[] => {
  if (content.sections?.length) return content.sections;
  const sections: ContentSection[] = [];
  if (content.content !== undefined) sections.push({ type: "explanation", content: content.content });
  if (content.code !== undefined) sections.push({ type: "code", code: content.code, language: content.language });
  return sections;
};

type Props = {
  content: ContentSource;
  language: "bn" | "en";
  activeLanguage?: CourseLanguage;
  getText: (text: LocalizedText) => string;
  getRichText: (text: LocalizedText) => RichTextContent;
  renderRichText: (text: RichTextContent) => ReactNode;
};

function CourseContentRenderer({ content, language, activeLanguage, getText, getRichText, renderRichText }: Props) {
  return (
    <article className="topic-content">
      {getSections(content).map((section, index) => {
        if (section.type === "explanation" || section.type === "only-text") {
          return (
            <section className={section.type === "explanation" ? "topic-explanation" : "topic-only-text"} key={`${section.type}-${index}`}>
              <p className="topic-description">{renderRichText(getRichText(section.content))}</p>
            </section>
          );
        }

        if (section.type === "bullet-points") {
          return (
            <section className="topic-bullet-points" key={`bullet-${index}`}>
              <ul>
                {section.items.map((item, itemIndex) => (
                  <li key={`${index}-${itemIndex}`}>{renderRichText(getRichText(item))}</li>
                ))}
              </ul>
            </section>
          );
        }

        if (section.type === "image") {
          return (
            <figure className="topic-image" key={`image-${index}`}>
              <img src={section.src} alt={section.alt} loading="lazy" decoding="async" />
              {section.caption && <figcaption>{getText(section.caption)}</figcaption>}
            </figure>
          );
        }

        return (
          <section className="topic-code-section" key={`code-${index}`}>
            <p className="section-label">{language === "bn" ? "কোড উদাহরণ" : "Code Example"}</p>
            <CodeBlock code={section.code} language={section.language} languageColor={activeLanguage?.color} />
          </section>
        );
      })}
    </article>
  );
}

export default CourseContentRenderer;
