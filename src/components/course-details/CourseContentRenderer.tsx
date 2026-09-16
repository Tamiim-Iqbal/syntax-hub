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
        if (section.type === "explanation" || section.type === "only-text" || section.type === "semi-title" || section.type === "red-text") {
          const className = section.type === "explanation" ? "topic-explanation" : section.type === "only-text" ? "topic-only-text" : section.type === "semi-title" ? "topic-semi-title" : "topic-red-text";
          return (
            <section className={className} key={`${section.type}-${index}`}>
              <p className={section.type === "semi-title" ? "topic-semi-title-text" : "topic-description"}>{renderRichText(getRichText(section.content))}</p>
            </section>
          );
        }

        if (section.type === "bullet-points") {
          const List = section.listStyle === "number" ? "ol" : "ul";
          return (
            <section className="topic-bullet-points" key={`bullet-${index}`}>
              <List className={`bullet-columns-${section.columns ?? 1}`}>
                {section.items.map((item, itemIndex) => (
                  <li key={`${index}-${itemIndex}`}>{renderRichText(getRichText(item))}</li>
                ))}
              </List>
            </section>
          );
        }

        if (section.type === "table") {
          return (
            <div className="topic-table-wrap" key={`table-${index}`}>
              <table className="topic-table">
                <tbody>
                  {section.rows.map((row, rowIndex) => (
                    <tr key={`row-${rowIndex}`}>
                      {row.map((cell, cellIndex) => {
                        const isHeader = (section.headerRows ?? []).includes(rowIndex) || (section.headerColumns ?? []).includes(cellIndex);
                        const Cell = isHeader ? "th" : "td";
                        return (
                          <Cell key={`cell-${rowIndex}-${cellIndex}`} className={isHeader ? "topic-table-header" : ""} style={{ textAlign: cell.align ?? "left" }}>
                            {renderRichText(getRichText(cell.content))}
                          </Cell>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (section.type === "image") {
          return (
            <figure className="topic-image" key={`image-${index}`}>
              <img
                src={section.src}
                alt={section.alt}
                loading="lazy"
                decoding="async"
                style={{
                  width: section.width || undefined,
                  height: section.height || undefined,
                }}
              />
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
