import { useAuth } from "../context/useAuth";
import "./Profile.css";

function Profile() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <main className="profile-page">
      <section className="profile-card">
        <span className="section-label">YOUR ACCOUNT</span>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        <span className="profile-role">{user.role}</span>

        <button
          type="button"
          className="profile-logout navbar-login"
          onClick={logout}
        >
          Logout
        </button>
      </section>
    </main>
  );
}

export default Profile;
