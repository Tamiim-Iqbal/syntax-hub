import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
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
            Home
          </NavLink>
        </nav>

        <div className="navbar-actions">
          <button className="navbar-language">বাংলা</button>

          <button className="navbar-login">
            Login
          </button>

          <button
            className="navbar-theme"
            aria-label="Toggle theme"
          >
            ☀
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;