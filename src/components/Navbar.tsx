import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

import { useLanguage } from "../context/useLanguage";
import { useTheme } from "../context/useTheme";
import { useAuth } from "../context/useAuth";

function Navbar() {
  const { language, toggleLanguage } =
    useLanguage();

  const { theme, toggleTheme } =
    useTheme();

  const { user, logout } = useAuth();

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

        {/* Logo */}
        <Link
          to="/"
          className="navbar-logo"
        >
          Syntax<span>Hub</span>
        </Link>

        {/* Navigation */}
        <nav className="navbar-nav">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            {navbarText.home[language]}
          </NavLink>
        </nav>

        {/* Actions */}
        <div className="navbar-actions">

          {/* Language */}
          <button
            type="button"
            className={`navbar-language-toggle ${
              language === "en"
                ? "english"
                : "bangla"
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

          {/* Authentication */}
          {user ? (
            <>
              <Link to="/profile" className="navbar-login">
                {user.name}
              </Link>
              <button
                type="button"
                className="navbar-login"
                onClick={logout}
                aria-label="Logout"
              >
                {language === "bn" ? "লগআউট" : "Logout"}
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar-login">
              {navbarText.login[language]}
            </Link>
          )}

          {/* Theme */}
          <button
            type="button"
            className="navbar-theme"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light"
              ? "🌙"
              : "☀"}
          </button>

        </div>
      </div>
    </header>
  );
}

export default Navbar;