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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    setMobileMenuOpen(false);
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
    home: { bn: "Home", en: "Home" },
    login: { bn: "Login", en: "Login" },
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo gradient-text">
          Syntax<span>Hub</span>
        </Link>

        <nav className="navbar-nav navbar-nav-desktop">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-link active gradient-text2" : "nav-link"
            }
          >
            {navbarText.home[language]}
          </NavLink>

          <NavLink
            to="/courses"
            className={({ isActive }) =>
              isActive || location.pathname.startsWith("/courses")
                ? "gradient-text2 nav-link active"
                : "nav-link"
            }
          >
            Courses
          </NavLink>
        </nav>

        <div className="navbar-mobile-menu-wrap">
          <button
            type="button"
            className="navbar-mobile-icon"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>

          {mobileMenuOpen && (
            <nav className="navbar-mobile-menu" aria-label="Mobile navigation">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "mobile-nav-link active" : "mobile-nav-link"
                }
              >
                {navbarText.home[language]}
              </NavLink>

              <NavLink
                to="/courses"
                className={({ isActive }) =>
                  isActive || location.pathname.startsWith("/courses")
                    ? "mobile-nav-link active"
                    : "mobile-nav-link"
                }
              >
                Courses
              </NavLink>

              <button
                type="button"
                className="mobile-nav-link mobile-nav-button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/search");
                }}
              >
                Search
              </button>
            </nav>
          )}
        </div>

        <form className="navbar-search" onSubmit={submitSearch} role="search">
          <span aria-hidden="true">⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={language === "bn" ? "Search" : "Search"}
            aria-label="Search SyntaxHub"
          />
        </form>

        <div className="navbar-actions">
          <button
            type="button"
            className={`navbar-language-toggle ${
              language === "en" ? "english" : "bangla"
            }`}
            onClick={toggleLanguage}
            aria-label="Toggle language"
          >
            <span className="language-option bangla-option">বাংলা</span>
            <span className="language-switch">
              <span className="language-dot" />
            </span>
            <span className="language-option english-option">EN</span>
          </button>

          {user ? (
            <>
              {user.role === "admin" && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `navbar-admin-link ${isActive ? "active" : ""}`
                  }
                >
                  Admin
                </NavLink>
              )}

              <Link
                to="/profile"
                className="navbar-user-name"
                aria-label="Open profile"
                title={user.name}
              >
                {(user.name || "User").trim().split(/\s+/)[0]}
              </Link>
            </>
          ) : (
            <Link to="/login" className="navbar-login ">
              {navbarText.login[language]}
            </Link>
          )}

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
