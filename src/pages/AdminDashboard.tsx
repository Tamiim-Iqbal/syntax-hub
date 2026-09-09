import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  createAdminCourse,
  deleteAdminCourse,
  getAdminCourses,
  getAdminOverview,
  getAdminUsers,
  updateAdminCourse,
  updateUserRole,
  type AdminCourse,
  type AdminOverview,
  type AdminUser,
} from "../services/adminService";
import "./AdminDashboard.css";

type CourseForm = {
  title: string;
  slug: string;
  category: string;
  type: "single-language" | "multi-language" | "problem-solving";
  description: string;
  level: string;
  order: string;
  isPublished: boolean;
  content: string;
};

const emptyForm: CourseForm = {
  title: "",
  slug: "",
  category: "",
  type: "single-language",
  description: "",
  level: "Beginner",
  order: "0",
  isPublished: true,
  content: JSON.stringify({ topics: [] }, null, 2),
};

function AdminDashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "courses">("overview");
  const [form, setForm] = useState<CourseForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [overviewData, usersData, coursesData] = await Promise.all([
        getAdminOverview(),
        getAdminUsers(),
        getAdminCourses(),
      ]);

      setOverview(overviewData);
      setUsers(usersData);
      setCourses(coursesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
    setError("");
  };

  const openEdit = (course: AdminCourse) => {
    setEditingId(course._id);
    setForm({
      title: course.title,
      slug: course.slug,
      category: course.category,
      type: course.type,
      description: course.description,
      level: course.level,
      order: String(course.order),
      isPublished: course.isPublished,
      content:
        course.type === "single-language"
          ? JSON.stringify({ topics: course.topics }, null, 2)
          : JSON.stringify(
              course.type === "multi-language"
                ? { languages: course.languages }
                : { categories: course.problemSolvingCategories },
              null,
              2
            ),
    });
    setFormOpen(true);
    setError("");
  };

  const handleCourseSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      let content: unknown;

      try {
        content = JSON.parse(form.content);
      } catch {
        throw new Error("Content must be valid JSON");
      }

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim().toLowerCase(),
        category: form.category.trim(),
        type: form.type,
        description: form.description.trim(),
        level: form.level.trim(),
        order: Number(form.order) || 0,
        isPublished: form.isPublished,
        content,
      };

      if (editingId) {
        await updateAdminCourse(editingId, payload);
      } else {
        await createAdminCourse(payload);
      }

      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course: AdminCourse) => {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) {
      return;
    }

    setError("");

    try {
      await deleteAdminCourse(course._id);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete course");
    }
  };

  const handleRoleChange = async (
    target: AdminUser,
    role: "user" | "admin"
  ) => {
    setError("");

    try {
      const updated = await updateUserRole(target.id, role);
      setUsers((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      );

      const refreshedOverview = await getAdminOverview();
      setOverview(refreshedOverview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  if (!user || user.role !== "admin") return null;

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <span className="section-label">ADMIN PANEL</span>
          <h1>Dashboard</h1>
          <p>Manage SyntaxHub users and courses.</p>
        </div>
        <Link className="admin-back-link" to="/">
          Back to website
        </Link>
      </header>

      <nav className="admin-tabs" aria-label="Admin sections">
        {(["overview", "users", "courses"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {error && <div className="admin-error" role="alert">{error}</div>}

      {loading ? (
        <div className="admin-loading">Loading dashboard...</div>
      ) : (
        <>
          {activeTab === "overview" && overview && (
            <section className="admin-stats" aria-label="Dashboard statistics">
              <article><span>Total Users</span><strong>{overview.users}</strong></article>
              <article><span>Total Courses</span><strong>{overview.courses}</strong></article>
              <article><span>Published Courses</span><strong>{overview.publishedCourses}</strong></article>
              <article><span>Admins</span><strong>{overview.admins}</strong></article>
            </section>
          )}

          {activeTab === "users" && (
            <section className="admin-panel-card">
              <div className="admin-section-heading">
                <div>
                  <h2>Users</h2>
                  <p>View accounts and manage administrator access.</p>
                </div>
                <span>{users.length} users</span>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {users.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.email}</td>
                        <td><span className={`admin-role ${item.role}`}>{item.role}</span></td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td>
                          {item.id === user.id ? (
                            <span className="admin-self">You</span>
                          ) : (
                            <button
                              type="button"
                              className="admin-small-button"
                              onClick={() =>
                                void handleRoleChange(
                                  item,
                                  item.role === "admin" ? "user" : "admin"
                                )
                              }
                            >
                              {item.role === "admin" ? "Make user" : "Make admin"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "courses" && (
            <section className="admin-panel-card">
              <div className="admin-section-heading">
                <div>
                  <h2>Courses</h2>
                  <p>Manage course metadata and publication status.</p>
                </div>
                <button type="button" className="admin-primary-button" onClick={openCreate}>
                  + Add Course
                </button>
              </div>

              {formOpen && (
                <form className="admin-course-form" onSubmit={handleCourseSubmit}>
                  <div className="admin-form-heading">
                    <h3>{editingId ? "Edit Course" : "Create Course"}</h3>
                    <button type="button" onClick={() => setFormOpen(false)}>Cancel</button>
                  </div>

                  <div className="admin-form-grid">
                    <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
                    <label>Slug<input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></label>
                    <label>Category<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></label>
                    <label>Level<input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} required /></label>
                    <label>Type
                      <select value={form.type} onChange={(e) => {
                        const type = e.target.value as CourseForm["type"];
                        const content =
                          type === "single-language"
                            ? { topics: [] }
                            : type === "multi-language"
                              ? { languages: [] }
                              : { categories: [] };
                        setForm({ ...form, type, content: JSON.stringify(content, null, 2) });
                      }}>
                        <option value="single-language">Single language</option>
                        <option value="multi-language">Multi language</option>
                        <option value="problem-solving">Problem solving</option>
                      </select>
                    </label>
                    <label>Order<input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></label>
                  </div>

                  <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} /></label>
                  <label>Content JSON<textarea className="admin-json-input" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={10} /></label>

                  <label className="admin-checkbox">
                    <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
                    Published
                  </label>

                  <button type="submit" className="admin-primary-button" disabled={saving}>
                    {saving ? "Saving..." : editingId ? "Save Changes" : "Create Course"}
                  </button>
                </form>
              )}

              <div className="admin-course-list">
                {courses.map((course) => (
                  <article className="admin-course-row" key={course._id}>
                    <div>
                      <h3>{course.title}</h3>
                      <p>/{course.slug} · {course.category} · {course.level}</p>
                    </div>
                    <div className="admin-course-actions">
                      <span className={`admin-publish ${course.isPublished ? "published" : "draft"}`}>
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                      <button type="button" className="admin-small-button" onClick={() => openEdit(course)}>Edit</button>
                      <button type="button" className="admin-danger-button" onClick={() => void handleDelete(course)}>Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default AdminDashboard;
