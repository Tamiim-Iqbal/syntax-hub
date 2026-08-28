import { useAuth } from "../context/useAuth";
import "./Profile.css";

function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <main className="profile-page">
      <section className="profile-card">
        <span className="section-label">YOUR ACCOUNT</span>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        <span className="profile-role">{user.role}</span>
      </section>
    </main>
  );
}

export default Profile;
