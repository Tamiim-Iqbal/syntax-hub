import type { LocalizedText } from "../types/course";

export const getDisplayText = (
  text: LocalizedText
): string => {
  if (typeof text === "string") {
    return text;
  }

  const value = text.en;

  if (typeof value === "string") {
    return value;
  }

  return value
    .map((part) =>
      typeof part === "string"
        ? part
        : part.text
    )
    .join("");
};