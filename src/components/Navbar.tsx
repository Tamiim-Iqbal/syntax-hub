import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navbarText = {
    home: {
      bn: "হোম",
      en: "Home",
    },

    login: {
      bn: "লগইন",
      en: "Login",
    },
  };
  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Syntax<span>Hub</span>
        </Link>

        <nav className="navbar-nav">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            {navbarText.home[language]}
          </NavLink>
        </nav>

        <div className="navbar-actions">
          <button
            className={`navbar-language-toggle ${language === "en" ? "english" : "bangla"
              }`}
            onClick={toggleLanguage}
            aria-label="Toggle language"
          >
            <span className="language-option bangla-option">
              বাংলা
            </span>

            <span className="language-switch">
              <span className="language-dot" />
            </span>

            <span className="language-option english-option">
              EN
            </span>
          </button>

          <button className="navbar-login">
            {navbarText.login[language]}
          </button>

          <button
            type="button"
            className="navbar-theme"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀"}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;