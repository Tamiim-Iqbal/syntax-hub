import { useEffect, useState } from "react";
import "./SitePopups.css";
import { RichTextRenderer } from "./RichTextRenderer";
import type { ContentSection, LocalizedText } from "../types/course";

type PopupItem = {
  _id?: string;
  title?: string;
  html?: string;
  sticker?: string;
  sections?: ContentSection[];
  delayMinutes?: number;
  delaySeconds?: number;
  closeAfterSeconds?: number;
  allowManualClose?: boolean;
  enabled?: boolean;
  size?: "default" | "small";
  position?:
  | "center"
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right"
  | "top-center";
};

type Config = { enabled: boolean; items: PopupItem[] };

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5050/api";

function safeHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc
    .querySelectorAll("script,style,iframe,object,embed,form,svg,math")
    .forEach((n) => n.remove());
  doc.querySelectorAll("*").forEach((el) => {
    Array.from(el.attributes).forEach((a) => {
      if (
        a.name.toLowerCase().startsWith("on") ||
        ((a.name === "href" || a.name === "src") &&
          /^\s*javascript:/i.test(a.value))
      ) {
        el.removeAttribute(a.name);
      }
    });
  });
  return doc.body.innerHTML;
}

export default function SitePopups() {
  const [config, setConfig] = useState<Config | null>(null);
  const [active, setActive] = useState<PopupItem | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/popups`)
      .then((r) => r.json())
      .then((r) => {
        if (r.success) setConfig(r.data);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (!config?.enabled) return;
    const enabled = config.items.filter((i) => i.enabled !== false);
    if (!enabled.length) return;

    let cancelled = false;
    const timers: number[] = [];
    let previousEnd = 0;

    enabled.forEach((item) => {
      const requested =
        Math.max(0, Number(item.delayMinutes) || 0) * 60000 +
        Math.max(0, Number(item.delaySeconds) || 0) * 1000;
      const triggerAt = Math.max(requested, previousEnd);

      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setActive(item);
          setElapsed(0);
        }, triggerAt),
      );

      previousEnd =
        triggerAt +
        Math.max(1, Number(item.closeAfterSeconds) || 10) * 1000 +
        250;
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [config]);

  useEffect(() => {
    if (!active) return;
    const start = Date.now();
    const id = window.setInterval(() => {
      const seconds = Math.floor((Date.now() - start) / 1000);
      setElapsed(seconds);
      if (seconds >= Math.max(1, Number(active.closeAfterSeconds) || 10)) {
        setActive(null);
      }
    }, 250);
    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;

  return (
    <div
      className={`site-popup-backdrop position-${active.position || "center"}`}
      role="presentation"
    >
      <section
        className={`site-popup ${active.size === "small" ? "site-popup-small" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={active.title || "Announcement"}
      >
        {active.allowManualClose && (
          <button
            className="site-popup-close"
            aria-label="Close popup"
            onClick={() => setActive(null)}
          >
            ×
          </button>
        )}
        <div className="site-popup-sticker" aria-hidden="true">
          {active.sticker || "📢"}
        </div>
        {active.title && <h2>{active.title}</h2>}
        <div className="site-popup-content">
          {active.sections?.length ? (
            active.sections.map((section, i) => {
              if (
                ["explanation", "only-text", "semi-title", "red-text"].includes(
                  section.type,
                )
              ) {
                const text = (
                  section as Extract<ContentSection, { content: LocalizedText }>
                ).content;
                const cls =
                  section.type === "semi-title"
                    ? "popup-semi-title"
                    : section.type === "red-text"
                      ? "popup-red-text"
                      : "popup-text";
                return (
                  <p className={cls} key={i}>
                    <RichTextRenderer value={text} language="en" />
                  </p>
                );
              }
              if (section.type === "bullet-points")
                return (
                  <ul key={i}>
                    {section.items.map((item, j) => (
                      <li key={j}>
                        <RichTextRenderer value={item} language="en" />
                      </li>
                    ))}
                  </ul>
                );
              if (section.type === "code")
                return (
                  <pre key={i}>
                    <code>{section.code}</code>
                  </pre>
                );
              if (section.type === "image")
                return (
                  <figure key={i}>
                    <img
                      src={section.src}
                      alt={section.alt}
                      style={{ maxWidth: "100%" }}
                    />
                    {section.caption && (
                      <figcaption>
                        <RichTextRenderer
                          value={section.caption}
                          language="en"
                        />
                      </figcaption>
                    )}
                  </figure>
                );
              if (section.type === "table")
                return (
                  <table key={i}>
                    <tbody>
                      {section.rows.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((cell, ci) => (
                            <td key={ci}>
                              <RichTextRenderer
                                value={cell.content}
                                language="en"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              return null;
            })
          ) : (
            <div dangerouslySetInnerHTML={{ __html: safeHtml(active.html || "") }} />
          )}
        </div>
        <div className="site-popup-progress">
          <span
            style={{
              width: `${Math.min(100, (elapsed / Math.max(1, Number(active.closeAfterSeconds) || 10)) * 100)}%`,
            }}
          />
        </div>
      </section>
    </div>
  );
}