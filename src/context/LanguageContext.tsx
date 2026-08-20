import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type SiteLanguage = "bn" | "en";

type LanguageContextType = {
  language: SiteLanguage;
  setLanguage: (language: SiteLanguage) => void;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<
  LanguageContextType | undefined
>(undefined);

type LanguageProviderProps = {
  children: ReactNode;
};

export function LanguageProvider({
  children,
}: LanguageProviderProps) {
  const [language, setLanguageState] =
    useState<SiteLanguage>(() => {
      const savedLanguage = localStorage.getItem(
        "syntaxhub-language"
      );

      return savedLanguage === "en" ? "en" : "bn";
    });

  useEffect(() => {
    localStorage.setItem(
      "syntaxhub-language",
      language
    );
  }, [language]);

  const setLanguage = (newLanguage: SiteLanguage) => {
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

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}