import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <section className="not-found-card">
        <p className="section-label">404</p>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or may have moved.</p>
        <div className="not-found-actions">
          <Link to="/" className="hero-primary-button">Go Home</Link>
          <Link to="/courses" className="course-back-button">Browse Courses</Link>
        </div>
      </section>
    </main>
  );
}
