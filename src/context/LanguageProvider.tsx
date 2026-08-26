import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  LanguageContext,
  type SiteLanguage,
} from "./languageContext";

type LanguageProviderProps = {
  children: ReactNode;
};

export function LanguageProvider({
  children,
}: LanguageProviderProps) {
  const [language, setLanguageState] =
    useState<SiteLanguage>(() => {
      const savedLanguage =
        localStorage.getItem(
          "syntaxhub-language"
        );

      return savedLanguage === "en"
        ? "en"
        : "bn";
    });

  useEffect(() => {
    localStorage.setItem(
      "syntaxhub-language",
      language
    );
  }, [language]);

  const setLanguage = (
    newLanguage: SiteLanguage
  ) => {
    setLanguageState(newLanguage);
  };

  const toggleLanguage = () => {
    setLanguageState((current) =>
      current === "bn" ? "en" : "bn"
    );
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}