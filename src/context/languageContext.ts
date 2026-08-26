import { createContext } from "react";

export type SiteLanguage = "bn" | "en";

export type LanguageContextType = {
  language: SiteLanguage;
  setLanguage: (language: SiteLanguage) => void;
  toggleLanguage: () => void;
};

export const LanguageContext =
  createContext<LanguageContextType | undefined>(
    undefined
  );