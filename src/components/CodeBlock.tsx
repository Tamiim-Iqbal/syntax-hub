import { useState } from "react";
import hljs from "highlight.js";

type CodeBlockProps = {
  code: string;
  language: string;
  languageColor?: string;
};

function CodeBlock({
  code,
  language,
  languageColor,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const highlightedCode = hljs.highlight(code, {
    language,
  }).value;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="code-block">
      {/* Header */}
      <div className="code-block-header">
        <div
          className="code-window-controls"
          aria-hidden="true"
        >
          <span className="code-dot red" />
          <span className="code-dot yellow" />
          <span className="code-dot green" />
        </div>

        <span
          className="code-language"
          style={{ color: languageColor }}
        >
          {language}
        </span>

        <button
          type="button"
          className="code-copy-button"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>

      {/* Code */}
      <pre className="code-block-content">
        <code
          className={`language-${language}`}
          dangerouslySetInnerHTML={{
            __html: highlightedCode,
          }}
        />
      </pre>
    </div>
  );
}

export default CodeBlock;