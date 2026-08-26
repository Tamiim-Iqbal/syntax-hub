import { useMemo, useState } from "react";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("csharp", csharp);

const aliases: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  "c++": "cpp",
  "c#": "csharp",
};

type CodeBlockProps = {
  code: string;
  language: string;
  languageColor?: string;
};

function CodeBlock({ code, language, languageColor }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const normalizedLanguage = aliases[language.toLowerCase()] ?? language.toLowerCase();

  const highlightedCode = useMemo(() => {
    const supportedLanguage = hljs.getLanguage(normalizedLanguage)
      ? normalizedLanguage
      : "plaintext";

    return hljs.highlight(code, { language: supportedLanguage }).value;
  }, [code, normalizedLanguage]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = code;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="code-block">
      <div className="code-block-header">
        <div className="code-window-controls" aria-hidden="true">
          <span className="code-dot red" />
          <span className="code-dot yellow" />
          <span className="code-dot green" />
        </div>
        <span className="code-language" style={{ color: languageColor }} aria-label={`Programming language: ${language}`}>
          {language}
        </span>
        <button
          type="button"
          className="code-copy-button"
          onClick={handleCopy}
          aria-label={copied ? "Code copied" : "Copy code"}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre className="code-block-content">
        <code
          className={`language-${normalizedLanguage}`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
}

export default CodeBlock;
