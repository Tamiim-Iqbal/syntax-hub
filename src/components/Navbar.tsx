import { useEffect, useState, type FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

import { useLanguage } from "../context/useLanguage";
import { useTheme } from "../context/useTheme";
import { useAuth } from "../context/useAuth";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const { language, toggleLanguage } =
    useLanguage();

  const { theme, toggleTheme } =
    useTheme();

  const { user, logout } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (location.pathname === "/search") setSearch(params.get("q") ?? "");
  }, [location.pathname, location.search]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
    else navigate("/search");
  };

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

          <NavLink
            to="/courses"
            className={({ isActive }) =>
              isActive || location.pathname.startsWith("/courses")
                ? "nav-link active"
                : "nav-link"
            }
          >
            {language === "bn" ? "কোর্স" : "Courses"}
          </NavLink>
        </nav>

        {/* Global Search */}
        <form className="navbar-search" onSubmit={submitSearch} role="search">
          <span aria-hidden="true">⌕</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={language === "bn" ? "Search" : "Search"} aria-label="Search SyntaxHub" />
        </form>

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
              {user.role === "admin" && (
                <Link to="/admin" className="navbar-admin-link">
                  Admin
                </Link>
              )}

              <Link to="/profile" className="navbar-user-name" aria-label="Open profile">
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