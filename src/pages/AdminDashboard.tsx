import { useEffect, useMemo, useState, type FormEvent } from "react";
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
  type AdminOverview,
  type AdminUser,
  type AdminCourse,
} from "../services/adminService";
import type {
  ContentSection,
  CourseLanguage,
  LocalizedText,
  RichTextContent,
  Problem,
  ProblemCategory,
  Subtopic,
  Topic,
} from "../types/course";
import "./AdminDashboard.css";

type CourseKind = "single-language" | "multi-language" | "problem-solving";
type ContentTab = "topics" | "problems";
type SectionKind = ContentSection["type"];

type CourseForm = {
  title: string;
  slug: string;
  category: string;
  type: CourseKind;
  description: string;
  level: string;
  order: string;
  isPublished: boolean;
  content: string;
};

type EditableTopic = Topic | Subtopic;

type ProblemEditor = Problem;

type LocalizedObject = { bn: RichTextContent; en: RichTextContent };

const emptyLocalized = (): LocalizedObject => ({ bn: "", en: "" });

const emptySection = (type: SectionKind = "explanation"): ContentSection => {
  if (type === "code") return { type, code: "", language: "javascript" };
  if (type === "image") return { type, src: "", alt: "", caption: emptyLocalized() };
  if (type === "bullet-points") return { type, items: [emptyLocalized()] };
  return { type, content: emptyLocalized() };
};

const emptyTopic = (language = "javascript"): Topic => ({
  _id: `topic-${Date.now()}`,
  title: emptyLocalized(),
  slug: `new-topic-${Date.now()}`,
  order: 1,
  language,
  sections: [emptySection()],
  subtopics: [],
});

const emptySubtopic = (language = "javascript"): Subtopic => ({
  _id: `subtopic-${Date.now()}`,
  title: emptyLocalized(),
  slug: `new-subtopic-${Date.now()}`,
  order: 1,
  language,
  sections: [emptySection()],
});

const emptyProblem = (): Problem => ({
  _id: `problem-${Date.now()}`,
  title: emptyLocalized(),
  slug: `new-problem-${Date.now()}`,
  order: 1,
  difficulty: "easy",
  rating: 0,
  judge: "",
  judgeUrl: "",
  problemNumber: "",
  topics: [],
  problem: {
    title: emptyLocalized(),
    description: emptyLocalized(),
    examples: [{ input: "", output: "", explanation: emptyLocalized() }],
    constraints: [emptyLocalized()],
  },
  approach: { title: emptyLocalized(), sections: [emptySection("only-text")] },
  solutions: [{ language: "javascript", label: "JavaScript", code: "" }],
});

const emptyCategory = (): ProblemCategory => ({
  _id: `category-${Date.now()}`,
  title: emptyLocalized(),
  slug: `new-category-${Date.now()}`,
  description: emptyLocalized(),
  order: 1,
  problems: [],
});

const asLocalized = (value: unknown): LocalizedObject => {
  if (typeof value === "string") return { bn: value, en: value };
  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;
    return { bn: (item.bn as RichTextContent) ?? "", en: (item.en as RichTextContent) ?? "" };
  }
  return emptyLocalized();
};


const displayLocalized = (value: LocalizedText): string => {
  const normalized = asLocalized(value);
  const part = normalized.en;
  if (typeof part === "string") return part;
  return part.map((item) => typeof item === "string" ? item : item.text).join("");
};

const normalizeSections = (item: EditableTopic): ContentSection[] => {
  if (Array.isArray(item.sections) && item.sections.length) return item.sections;
  const sections: ContentSection[] = [];
  if (item.content !== undefined) sections.push({ type: "explanation", content: asLocalized(item.content) });
  if (item.code !== undefined) sections.push({ type: "code", code: item.code, language: item.language || "javascript" });
  return sections.length ? sections : [emptySection()];
};

const sectionLabel = (type: SectionKind) => ({
  explanation: "Explanation",
  "only-text": "Text / Note",
  "bullet-points": "Bullet Points",
  code: "Code",
  image: "Image",
}[type]);

function LocalizedFields({ value, onChange, labels = ["Bangla", "English"] }: {
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  labels?: [string, string];
}) {
  const normalized = asLocalized(value);
  const asInput = (part: unknown) => typeof part === "string" ? part : JSON.stringify(part ?? "");
  return (
    <div className="admin-localized-grid">
      <label>{labels[0]}<textarea rows={3} value={asInput(normalized.bn)} onChange={(e) => onChange({ ...normalized, bn: e.target.value })} /></label>
      <label>{labels[1]}<textarea rows={3} value={asInput(normalized.en)} onChange={(e) => onChange({ ...normalized, en: e.target.value })} /></label>
    </div>
  );
}

function SectionEditor({ section, index, onChange, onDelete, onMove }: {
  section: ContentSection;
  index: number;
  onChange: (section: ContentSection) => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  return (
    <div className="cms-section-card">
      <div className="cms-section-head">
        <strong>{index + 1}. {sectionLabel(section.type)}</strong>
        <div>
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0}>↑</button>
          <button type="button" onClick={() => onMove(1)}>↓</button>
          <button type="button" className="admin-danger-button" onClick={onDelete}>Delete</button>
        </div>
      </div>
      {section.type === "explanation" || section.type === "only-text" ? (
        <LocalizedFields value={section.content} onChange={(content) => onChange({ ...section, content })} />
      ) : section.type === "bullet-points" ? (
        <div>
          {section.items.map((item, itemIndex) => (
            <div className="cms-inline-row" key={itemIndex}>
              <LocalizedFields value={item} onChange={(next) => onChange({ ...section, items: section.items.map((x, i) => i === itemIndex ? next : x) })} />
              <button type="button" className="admin-danger-button" onClick={() => onChange({ ...section, items: section.items.filter((_, i) => i !== itemIndex) })}>Remove</button>
            </div>
          ))}
          <button type="button" className="admin-small-button" onClick={() => onChange({ ...section, items: [...section.items, emptyLocalized()] })}>+ Bullet</button>
        </div>
      ) : section.type === "code" ? (
        <div className="admin-form-grid">
          <label>Language<input value={section.language} onChange={(e) => onChange({ ...section, language: e.target.value })} placeholder="javascript" /></label>
          <label className="cms-full">Code<textarea className="admin-code-input" rows={10} value={section.code} onChange={(e) => onChange({ ...section, code: e.target.value })} /></label>
        </div>
      ) : (
        <div className="admin-form-grid">
          <label>Image URL<input value={section.src} onChange={(e) => onChange({ ...section, src: e.target.value })} placeholder="https://..." /></label>
          <label>Alt text<input value={section.alt} onChange={(e) => onChange({ ...section, alt: e.target.value })} /></label>
          <div className="cms-full"><span className="admin-field-label">Caption</span><LocalizedFields value={section.caption ?? emptyLocalized()} onChange={(caption) => onChange({ ...section, caption })} /></div>
          {section.src && <img className="cms-image-preview" src={section.src} alt={section.alt || "Preview"} />}
        </div>
      )}
    </div>
  );
}

function ContentBlocksEditor({ sections, onChange }: { sections: ContentSection[]; onChange: (sections: ContentSection[]) => void }) {
  const update = (index: number, section: ContentSection) => onChange(sections.map((x, i) => i === index ? section : x));
  const remove = (index: number) => onChange(sections.filter((_, i) => i !== index));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  return (
    <div className="cms-blocks">
      {sections.map((section, index) => <SectionEditor key={index} section={section} index={index} onChange={(s) => update(index, s)} onDelete={() => remove(index)} onMove={(d) => move(index, d)} />)}
      <div className="cms-add-row">
        {(["explanation", "only-text", "bullet-points", "code", "image"] as SectionKind[]).map((type) => <button key={type} type="button" className="admin-small-button" onClick={() => onChange([...sections, emptySection(type)])}>+ {sectionLabel(type)}</button>)}
      </div>
    </div>
  );
}

function TopicEditor({ topic, onSave, onCancel, onAddSubtopic, editingSubtopic, setEditingSubtopic }: {
  topic: EditableTopic;
  onSave: (topic: EditableTopic) => void;
  onCancel: () => void;
  onAddSubtopic?: () => void;
  editingSubtopic?: Subtopic | null;
  setEditingSubtopic?: (value: Subtopic | null) => void;
}) {
  const [draft, setDraft] = useState<EditableTopic>({ ...topic, sections: normalizeSections(topic) });
  useEffect(() => setDraft({ ...topic, sections: normalizeSections(topic) }), [topic]);
  const subtopics = "subtopics" in draft ? draft.subtopics ?? [] : [];
  const updateSubtopics = (next: Subtopic[]) => setDraft({ ...(draft as Topic), subtopics: next });
  return (
    <div className="cms-editor-card">
      <div className="admin-form-heading"><h3>{topic._id.startsWith("topic-") || topic._id.startsWith("subtopic-") ? "Add Topic" : "Edit Topic"}</h3><button type="button" onClick={onCancel}>Cancel</button></div>
      <div className="admin-form-grid">
        <label>Title (shown in sidebar)<LocalizedFields value={draft.title} onChange={(title) => setDraft({ ...draft, title })} /></label>
        <label>Slug<input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} /></label>
        <label>Order<input type="number" value={draft.order} onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) || 0 })} /></label>
        <label>Code language<input value={draft.language} onChange={(e) => setDraft({ ...draft, language: e.target.value })} /></label>
      </div>
      <h4>Content Blocks</h4>
      <ContentBlocksEditor sections={draft.sections ?? []} onChange={(sections) => setDraft({ ...draft, sections })} />

      {"subtopics" in draft && (
        <div className="cms-subtopics">
          <div className="admin-section-heading"><div><h4>Subtopics</h4><p>Add as many subtopics as you need under this main topic.</p></div><button type="button" className="admin-small-button" onClick={onAddSubtopic}>+ Add Subtopic</button></div>
          {subtopics.map((sub, index) => (
            <div className="cms-list-row" key={sub._id}><span>{String(sub.order).padStart(2, "0")}</span><strong>{displayLocalized(sub.title) || "Untitled"}</strong><div><button type="button" className="admin-small-button" onClick={() => setEditingSubtopic?.(sub)}>Edit</button><button type="button" className="admin-danger-button" onClick={() => updateSubtopics(subtopics.filter((_, i) => i !== index))}>Delete</button></div></div>
          ))}
          {editingSubtopic && <TopicEditor topic={editingSubtopic} onSave={(saved) => { updateSubtopics(subtopics.map((x) => x._id === saved._id ? saved as Subtopic : x)); setEditingSubtopic?.(null); }} onCancel={() => setEditingSubtopic?.(null)} />}
        </div>
      )}
      <div className="cms-save-row"><button type="button" className="admin-primary-button" onClick={() => onSave(draft)}>Save Topic</button><button type="button" className="admin-small-button" onClick={onCancel}>Cancel</button></div>
    </div>
  );
}

function ProblemEditor({ problem, onSave, onCancel }: { problem: ProblemEditor; onSave: (problem: Problem) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<Problem>({ ...problem });
  const updateProblem = (patch: Partial<Problem>) => setDraft((current) => ({ ...current, ...patch }));
  const updateProblemBody = (patch: any) => setDraft((current) => ({ ...current, problem: { ...(current.problem ?? { title: emptyLocalized(), description: emptyLocalized() }), ...patch } }));
  const examples = draft.problem?.examples ?? [];
  const constraints = draft.problem?.constraints ?? [];
  const approach = draft.approach ?? { title: emptyLocalized(), sections: [] };
  const solutions = draft.solutions ?? [];
  return (
    <div className="cms-editor-card">
      <div className="admin-form-heading"><h3>Edit Problem</h3><button type="button" onClick={onCancel}>Cancel</button></div>
      <div className="admin-form-grid">
        <label>Title<LocalizedFields value={draft.title} onChange={(title) => updateProblem({ title })} /></label>
        <label>Slug<input value={draft.slug} onChange={(e) => updateProblem({ slug: e.target.value })} /></label>
        <label>Order<input type="number" value={draft.order} onChange={(e) => updateProblem({ order: Number(e.target.value) || 0 })} /></label>
        <label>Difficulty<select value={draft.difficulty ?? "easy"} onChange={(e) => updateProblem({ difficulty: e.target.value as Problem["difficulty"] })}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
        <label>Judge<input value={draft.judge} onChange={(e) => updateProblem({ judge: e.target.value })} /></label>
        <label>Judge URL<input value={draft.judgeUrl ?? ""} onChange={(e) => updateProblem({ judgeUrl: e.target.value })} /></label>
        <label>Problem Number<input value={draft.problemNumber} onChange={(e) => updateProblem({ problemNumber: e.target.value })} /></label>
        <label>Rating<input type="number" value={draft.rating ?? 0} onChange={(e) => updateProblem({ rating: Number(e.target.value) || 0 })} /></label>
        <label className="cms-full">Topics (comma separated)<input value={draft.topics.join(", ")} onChange={(e) => updateProblem({ topics: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></label>
      </div>

      <h4>Problem Statement</h4>
      <LocalizedFields value={draft.problem?.title ?? emptyLocalized()} onChange={(title) => updateProblemBody({ ...(draft.problem ?? {}), title })} />
      <LocalizedFields value={draft.problem?.description ?? emptyLocalized()} onChange={(description) => updateProblemBody({ ...(draft.problem ?? {}), description })} />

      <h4>Examples</h4>
      {examples.map((example, index) => <div className="cms-example-card" key={index}><label>Input<textarea value={example.input} onChange={(e) => updateProblemBody({ ...(draft.problem ?? {}), examples: examples.map((x, i) => i === index ? { ...x, input: e.target.value } : x) })} /></label><label>Output<textarea value={example.output} onChange={(e) => updateProblemBody({ ...(draft.problem ?? {}), examples: examples.map((x, i) => i === index ? { ...x, output: e.target.value } : x) })} /></label><LocalizedFields value={example.explanation ?? emptyLocalized()} onChange={(explanation) => updateProblemBody({ ...(draft.problem ?? {}), examples: examples.map((x, i) => i === index ? { ...x, explanation } : x) })} /><button type="button" className="admin-danger-button" onClick={() => updateProblemBody({ ...(draft.problem ?? {}), examples: examples.filter((_, i) => i !== index) })}>Remove Example</button></div>)}
      <button type="button" className="admin-small-button" onClick={() => updateProblemBody({ ...(draft.problem ?? {}), examples: [...examples, { input: "", output: "", explanation: emptyLocalized() }] })}>+ Add Example</button>

      <h4>Constraints</h4>
      {constraints.map((constraint, index) => <div className="cms-inline-row" key={index}><LocalizedFields value={constraint} onChange={(value) => updateProblemBody({ ...(draft.problem ?? {}), constraints: constraints.map((x, i) => i === index ? value : x) })} /><button type="button" className="admin-danger-button" onClick={() => updateProblemBody({ ...(draft.problem ?? {}), constraints: constraints.filter((_, i) => i !== index) })}>Remove</button></div>)}
      <button type="button" className="admin-small-button" onClick={() => updateProblemBody({ ...(draft.problem ?? {}), constraints: [...constraints, emptyLocalized()] })}>+ Add Constraint</button>

      <h4>Approach</h4>
      <LocalizedFields value={approach.title} onChange={(title) => updateProblem({ approach: { ...approach, title } })} />
      <ContentBlocksEditor sections={approach.sections ?? []} onChange={(sections) => updateProblem({ approach: { ...approach, sections } })} />

      <h4>Solutions</h4>
      {solutions.map((solution, index) => <div className="cms-solution-card" key={index}><div className="admin-form-grid"><label>Language<input value={solution.language} onChange={(e) => updateProblem({ solutions: solutions.map((x, i) => i === index ? { ...x, language: e.target.value } : x) })} /></label><label>Label<input value={solution.label} onChange={(e) => updateProblem({ solutions: solutions.map((x, i) => i === index ? { ...x, label: e.target.value } : x) })} /></label><label className="cms-full">Code<textarea className="admin-code-input" rows={10} value={solution.code} onChange={(e) => updateProblem({ solutions: solutions.map((x, i) => i === index ? { ...x, code: e.target.value } : x) })} /></label></div><button type="button" className="admin-danger-button" onClick={() => updateProblem({ solutions: solutions.filter((_, i) => i !== index) })}>Remove Solution</button></div>)}
      <button type="button" className="admin-small-button" onClick={() => updateProblem({ solutions: [...solutions, { language: "javascript", label: "JavaScript", code: "" }] })}>+ Add Solution</button>

      <div className="cms-save-row"><button type="button" className="admin-primary-button" onClick={() => onSave(draft)}>Save Problem</button><button type="button" className="admin-small-button" onClick={onCancel}>Cancel</button></div>
    </div>
  );
}

function AdminDashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "courses" | "content">("overview");
  const [contentTab, setContentTab] = useState<ContentTab>("topics");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedLanguageId, setSelectedLanguageId] = useState("");
  const [editingTopic, setEditingTopic] = useState<EditableTopic | null>(null);
  const [editingSubtopic, setEditingSubtopic] = useState<Subtopic | null>(null);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [savingContent, setSavingContent] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseForm>({ title: "", slug: "", category: "", type: "single-language", description: "", level: "Beginner", order: "0", isPublished: true, content: JSON.stringify({ topics: [] }, null, 2) });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDashboard = async () => {
    setLoading(true); setError("");
    try {
      const [o, u, c] = await Promise.all([getAdminOverview(), getAdminUsers(), getAdminCourses()]);
      setOverview(o); setUsers(u); setCourses(c);
      if (!selectedCourseId && c[0]) setSelectedCourseId(c[0]._id);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to load dashboard"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void loadDashboard(); }, []);

  const selectedCourse = useMemo(() => courses.find((course) => course._id === selectedCourseId) ?? null, [courses, selectedCourseId]);
  const courseContent = useMemo(() => {
    const raw = selectedCourse?.content;
    return raw && typeof raw === "object" ? raw as Record<string, any> : {};
  }, [selectedCourse]);
  const languages = selectedCourse?.type === "multi-language"
    ? ((selectedCourse.languages?.length ? selectedCourse.languages : courseContent.languages) ?? [])
    : [];
  const activeLanguage = languages.find((language) => language.id === selectedLanguageId) ?? languages[0];
  const topicList: Topic[] = selectedCourse?.type === "single-language"
    ? ((selectedCourse.topics?.length ? selectedCourse.topics : courseContent.topics) ?? [])
    : selectedCourse?.type === "multi-language"
      ? (activeLanguage?.topics ?? [])
      : [];
  const problemCategories: ProblemCategory[] = selectedCourse?.type === "problem-solving"
    ? ((selectedCourse.problemSolvingCategories?.length ? selectedCourse.problemSolvingCategories : courseContent.categories) ?? [])
    : [];

  useEffect(() => {
    if (languages[0] && !languages.some((x) => x.id === selectedLanguageId)) setSelectedLanguageId(languages[0].id);
  }, [selectedCourseId, languages, selectedLanguageId]);

  const saveCourseContent = async (content: unknown, languagesOverride?: CourseLanguage[]) => {
    if (!selectedCourse) return;
    setSavingContent(true); setError(""); setNotice("");
    try {
      const updated = await updateAdminCourse(selectedCourse._id, { content, ...(languagesOverride ? { languages: languagesOverride } : {}) });
      setCourses((current) => current.map((course) => course._id === updated._id ? updated : course));
      setNotice("Content saved successfully.");
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to save content"); }
    finally { setSavingContent(false); }
  };

  const saveTopics = (nextTopics: Topic[]) => {
    if (!selectedCourse) return;
    if (selectedCourse.type === "single-language") {
      void saveCourseContent({ ...courseContent, topics: nextTopics });
    } else if (selectedCourse.type === "multi-language" && activeLanguage) {
      const nextLanguages = languages.map((language) =>
        language.id === activeLanguage.id ? { ...language, topics: nextTopics } : language
      );
      void saveCourseContent({ ...courseContent, languages: nextLanguages }, nextLanguages);
    }
  };

  const addTopic = () => { setEditingSubtopic(null); setEditingTopic(emptyTopic(activeLanguage?.id ?? "javascript")); };
  const editTopic = (topic: Topic) => { setEditingSubtopic(null); setEditingTopic({ ...topic, sections: normalizeSections(topic) }); };
  const saveTopic = (saved: EditableTopic) => {
    if (!selectedCourse || selectedCourse.type === "problem-solving") return;
    const topics = [...topicList] as Topic[];
    const isSub = "subtopics" in saved === false && editingTopic?._id.startsWith("subtopic-");
    if (isSub) return;
    const index = topics.findIndex((x) => x._id === saved._id);
    const next = index >= 0 ? topics.map((x, i) => i === index ? saved as Topic : x) : [...topics, { ...(saved as Topic), order: topics.length + 1 }];
    saveTopics(next);
    setEditingTopic(null);
  };

  const deleteTopic = (id: string) => { if (window.confirm("Delete this topic and all its subtopics?")) saveTopics(topicList.filter((topic) => topic._id !== id)); };
  const moveTopic = (index: number, direction: -1 | 1) => { const target = index + direction; if (target < 0 || target >= topicList.length) return; const next = [...topicList]; [next[index], next[target]] = [next[target], next[index]]; saveTopics(next.map((x, i) => ({ ...x, order: i + 1 }))); };

  const saveProblems = (categories: ProblemCategory[]) => {
    if (selectedCourse) void saveCourseContent({ ...courseContent, categories });
  };
  const addCategory = () => { const next = [...problemCategories, { ...emptyCategory(), order: problemCategories.length + 1 }]; saveProblems(next); };
  const addProblem = (category: ProblemCategory) => { setEditingCategoryId(category._id); setEditingProblem({ ...emptyProblem(), order: category.problems.length + 1 }); };
  const editProblem = (category: ProblemCategory, problem: Problem) => { setEditingCategoryId(category._id); setEditingProblem(problem); };
  const saveProblem = (saved: Problem) => { if (!editingCategoryId) return; const next = problemCategories.map((category) => category._id === editingCategoryId ? { ...category, problems: category.problems.some((p) => p._id === saved._id) ? category.problems.map((p) => p._id === saved._id ? saved : p) : [...category.problems, saved] } : category); saveProblems(next); setEditingProblem(null); setEditingCategoryId(null); };
  const deleteProblem = (categoryId: string, problemId: string) => { if (!window.confirm("Delete this problem?")) return; saveProblems(problemCategories.map((category) => category._id === categoryId ? { ...category, problems: category.problems.filter((p) => p._id !== problemId).map((p, i) => ({ ...p, order: i + 1 })) } : category)); };
  const deleteCategory = (id: string) => { if (!window.confirm("Delete this category and its problems?")) return; saveProblems(problemCategories.filter((x) => x._id !== id).map((x, i) => ({ ...x, order: i + 1 }))); };

  const openCreateCourse = () => { setEditingId(null); setForm({ title: "", slug: "", category: "", type: "single-language", description: "", level: "Beginner", order: "0", isPublished: true, content: JSON.stringify({ topics: [] }, null, 2) }); setFormOpen(true); };
  const openEditCourse = (course: AdminCourse) => {
    const rawContent = course.content && typeof course.content === "object" ? course.content : {};
    const fallbackContent = course.type === "single-language"
      ? { topics: course.topics ?? (rawContent as any).topics ?? [] }
      : course.type === "multi-language"
        ? { languages: course.languages ?? (rawContent as any).languages ?? [] }
        : { categories: course.problemSolvingCategories ?? (rawContent as any).categories ?? [] };
    setEditingId(course._id);
    setForm({ title: course.title, slug: course.slug, category: course.category, type: course.type, description: course.description, level: course.level, order: String(course.order), isPublished: course.isPublished, content: JSON.stringify(fallbackContent, null, 2) });
    setFormOpen(true);
  };
  const submitCourse = async (event: FormEvent) => { event.preventDefault(); try { const content = JSON.parse(form.content); const payload = { title: form.title.trim(), slug: form.slug.trim().toLowerCase(), category: form.category.trim(), type: form.type, description: form.description.trim(), level: form.level.trim(), order: Number(form.order) || 0, isPublished: form.isPublished, content, ...(form.type === "multi-language" && content.languages ? { languages: content.languages } : {}) }; if (editingId) await updateAdminCourse(editingId, payload); else await createAdminCourse(payload); setFormOpen(false); await loadDashboard(); } catch (err) { setError(err instanceof Error ? err.message : "Invalid course content"); } };
  const deleteCourse = async (course: AdminCourse) => { if (!window.confirm(`Delete "${course.title}"?`)) return; try { await deleteAdminCourse(course._id); await loadDashboard(); } catch (err) { setError(err instanceof Error ? err.message : "Failed to delete course"); } };
  const roleChange = async (target: AdminUser) => { try { const role = target.role === "admin" ? "user" : "admin"; const updated = await updateUserRole(target.id, role); setUsers((current) => current.map((x) => x.id === updated.id ? updated : x)); setOverview(await getAdminOverview()); } catch (err) { setError(err instanceof Error ? err.message : "Failed to update role"); } };

  if (!user || user.role !== "admin") return null;
  return (
    <main className="admin-page">
      <header className="admin-header"><div><span className="section-label">ADMIN PANEL</span><h1>Dashboard</h1><p>Manage SyntaxHub users, courses and learning content.</p></div><Link className="admin-back-link" to="/">Back to website</Link></header>
      <nav className="admin-tabs" aria-label="Admin sections">
        {(["overview", "users", "courses", "content"] as const).map((tab) => <button key={tab} type="button" className={activeTab === tab ? "active" : ""} onClick={() => { setActiveTab(tab); setEditingTopic(null); setEditingProblem(null); }}>{tab === "content" ? "Content Management" : tab[0].toUpperCase() + tab.slice(1)}</button>)}
      </nav>
      {error && <div className="admin-error" role="alert">{error}</div>}
      {notice && <div className="admin-success" role="status">{notice}</div>}
      {loading ? <div className="admin-loading">Loading dashboard...</div> : (
        <>
          {activeTab === "overview" && overview && <section className="admin-stats"><article><span>Total Users</span><strong>{overview.users}</strong></article><article><span>Total Courses</span><strong>{overview.courses}</strong></article><article><span>Published Courses</span><strong>{overview.publishedCourses}</strong></article><article><span>Admins</span><strong>{overview.admins}</strong></article></section>}
          {activeTab === "users" && <section className="admin-panel-card"><div className="admin-section-heading"><div><h2>Users</h2><p>Manage administrator access.</p></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr></thead><tbody>{users.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.email}</td><td><span className={`admin-role ${item.role}`}>{item.role}</span></td><td>{new Date(item.createdAt).toLocaleDateString()}</td><td>{item.id === user.id ? <span className="admin-self">You</span> : <button type="button" className="admin-small-button" onClick={() => void roleChange(item)}>{item.role === "admin" ? "Make user" : "Make admin"}</button>}</td></tr>)}</tbody></table></div></section>}
          {activeTab === "courses" && <section className="admin-panel-card"><div className="admin-section-heading"><div><h2>Courses</h2><p>Manage metadata and publication status. Detailed content is managed from Content Management.</p></div><button type="button" className="admin-primary-button" onClick={openCreateCourse}>+ Add Course</button></div>{formOpen && <form className="admin-course-form" onSubmit={submitCourse}><div className="admin-form-heading"><h3>{editingId ? "Edit Course" : "Create Course"}</h3><button type="button" onClick={() => setFormOpen(false)}>Cancel</button></div><div className="admin-form-grid"><label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label>Slug<input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></label><label>Category<input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label><label>Level<input required value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} /></label><label>Type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CourseKind })}><option value="single-language">Single language</option><option value="multi-language">Multi language</option><option value="problem-solving">Problem solving</option></select></label><label>Order<input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></label></div><label>Description<textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><label>Initial Content JSON<textarea className="admin-json-input" rows={12} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></label><label className="admin-checkbox"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Published</label><button className="admin-primary-button" type="submit">{editingId ? "Save Changes" : "Create Course"}</button></form>}<div className="admin-course-list">{courses.map((course) => <article className="admin-course-row" key={course._id}><div><h3>{course.title}</h3><p>/{course.slug} · {course.category} · {course.level}</p></div><div className="admin-course-actions"><span className={`admin-publish ${course.isPublished ? "published" : "draft"}`}>{course.isPublished ? "Published" : "Draft"}</span><button type="button" className="admin-small-button" onClick={() => openEditCourse(course)}>Edit</button><button type="button" className="admin-danger-button" onClick={() => void deleteCourse(course)}>Delete</button></div></article>)}</div></section>}

          {activeTab === "content" && <section className="admin-panel-card cms-page">
            <div className="admin-section-heading"><div><h2>Content Management</h2><p>Choose a course, select a topic or problem from the left, and edit its existing content on the right.</p></div></div>
            <div className="cms-course-picker">
              <label>Course<select value={selectedCourseId} onChange={(e) => { setSelectedCourseId(e.target.value); setEditingTopic(null); setEditingProblem(null); setEditingCategoryId(null); setEditingSubtopic(null); }}>
                <option value="">Select a course</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.title} — {course.type}</option>)}
              </select></label>
              {selectedCourse?.type === "multi-language" && <label>Programming Language<select value={activeLanguage?.id ?? ""} onChange={(e) => { setSelectedLanguageId(e.target.value); setEditingTopic(null); }}>{languages.map((language) => <option key={language.id} value={language.id}>{language.name}</option>)}</select></label>}
            </div>

            {!selectedCourse ? <div className="admin-empty">Select a course to manage its content.</div> : selectedCourse.type === "problem-solving" ? (
              <div className="cms-workspace">
                <aside className="cms-sidebar">
                  <div className="cms-sidebar-head"><div><strong>Problems</strong><small>{problemCategories.reduce((sum, c) => sum + c.problems.length, 0)} total</small></div><button type="button" className="admin-small-button" onClick={addCategory}>+ Category</button></div>
                  {problemCategories.map((category) => <div className="cms-sidebar-group" key={category._id}>
                    <div className="cms-sidebar-group-title"><strong>{category.order}. {displayLocalized(category.title) || "Untitled Category"}</strong><button type="button" className="admin-danger-button" onClick={() => deleteCategory(category._id)}>Delete</button></div>
                    {category.problems.map((problem) => <button type="button" className={`cms-sidebar-item ${editingProblem?._id === problem._id ? "active" : ""}`} key={problem._id} onClick={() => editProblem(category, problem)}><span>{String(problem.order).padStart(2, "0")}</span><span>{displayLocalized(problem.title) || "Untitled Problem"}</span></button>)}
                    <button type="button" className="cms-sidebar-add" onClick={() => addProblem(category)}>+ Add Problem</button>
                  </div>)}
                </aside>
                <div className="cms-editor-pane">
                  {!editingProblem ? <div className="cms-editor-empty"><div className="cms-editor-empty-icon">📝</div><h3>Select a problem</h3><p>Select an existing problem from the left, or click <strong>+ Add Problem</strong> to create one.</p></div> : <ProblemEditor problem={editingProblem} onSave={saveProblem} onCancel={() => { setEditingProblem(null); setEditingCategoryId(null); }} />}
                </div>
              </div>
            ) : (
              <div className="cms-workspace">
                <aside className="cms-sidebar">
                  <div className="cms-sidebar-head"><div><strong>Topics</strong><small>{topicList.length} main topics</small></div><button type="button" className="admin-small-button" onClick={addTopic}>+ Topic</button></div>
                  {topicList.map((topic, index) => <div className="cms-sidebar-group" key={topic._id}>
                    <button type="button" className={`cms-sidebar-item cms-sidebar-topic ${editingTopic?._id === topic._id ? "active" : ""}`} onClick={() => editTopic(topic)}><span>{String(index + 1).padStart(2, "0")}</span><span>{displayLocalized(topic.title) || "Untitled Topic"}<small>{topic.subtopics?.length ?? 0} subtopics</small></span></button>
                  </div>)}
                </aside>
                <div className="cms-editor-pane">
                  {!editingTopic ? <div className="cms-editor-empty"><div className="cms-editor-empty-icon">✏️</div><h3>Select a topic</h3><p>Select a topic from the left. Its existing content will appear here and you can change anything without scrolling to the bottom.</p></div> : <TopicEditor topic={editingTopic} onSave={saveTopic} onCancel={() => setEditingTopic(null)} onAddSubtopic={() => { setEditingSubtopic(emptySubtopic(editingTopic.language)); }} editingSubtopic={editingSubtopic} setEditingSubtopic={setEditingSubtopic} />}
                </div>
              </div>
            )}
            {savingContent && <div className="admin-saving">Saving content to MongoDB...</div>}
          </section>}
        </>
      )}
    </main>
  );
}

export default AdminDashboard;
