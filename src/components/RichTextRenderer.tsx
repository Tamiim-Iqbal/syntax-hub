import type { ReactNode } from "react";
import type { BoldPart, HighlightPart, InlineCodePart, LocalizedText, RichTextContent } from "../types/course";

type RichPart = string | HighlightPart | BoldPart | InlineCodePart;

const isRichPart = (value: unknown): value is RichPart =>
  typeof value === "string" ||
  (typeof value === "object" && value !== null &&
    ["highlight", "bold", "inline-code"].includes((value as { type?: unknown }).type as string) &&
    typeof (value as { text?: unknown }).text === "string");

const tryParseRichText = (value: string): RichTextContent => {
  const trimmed = value.trim();
  if (!trimmed) return value;

  const candidates = [
    trimmed,
    trimmed.replace(/^\(\s*/, "").replace(/\s*,?\s*\)$/, ""),
  ];

  for (const candidate of candidates) {
    try {
      const parsed: unknown = JSON.parse(candidate);
      if (isRichPart(parsed)) return [parsed];
      if (Array.isArray(parsed) && parsed.every(isRichPart)) return parsed;
    } catch {
      // Continue to the next supported representation.
    }
  }

  // Also support the compact CMS form: {"type":"bold","text":"x"},{"type":"inline-code","text":"y"}
  const wrapped = `[${trimmed.replace(/^\(\s*/, "").replace(/\s*\)\s*$/, "").replace(/,\s*$/, "")}]`;
  try {
    const parsed: unknown = JSON.parse(wrapped);
    if (Array.isArray(parsed) && parsed.every(isRichPart)) return parsed;
  } catch {
    // Plain text is the normal fallback.
  }

  return value;
};

export const normalizeRichText = (value: RichTextContent): RichTextContent =>
  typeof value === "string" ? tryParseRichText(value) : value;

export function RichTextRenderer({
  value,
  language = "en",
}: {
  value: RichTextContent | LocalizedText;
  language?: "bn" | "en";
}): ReactNode {
  const localizedValue =
    typeof value === "object" && !Array.isArray(value) && "bn" in value && "en" in value
      ? value[language]
      : value;
  const normalized = normalizeRichText(localizedValue);
  if (typeof normalized === "string") return normalized;

  return normalized.map((part, index) => {
    if (typeof part === "string") return part;
    if (part.type === "bold") return <strong key={index}>{part.text}</strong>;
    if (part.type === "inline-code") return <code key={index} className="inline-code">{part.text}</code>;
    return <span key={index} className="text-highlight">{part.text}</span>;
  });
}
