import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
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
  getImageKitAuth,
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

type CourseKind = "single-language" | "multi-language" | "problem-solving" | "nested";
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
  isTopLevel: boolean;
  content: string;
  copySourceCourseId: string;
};

type EditableTopic = Topic | Subtopic;

type ProblemEditor = Problem;

type LocalizedObject = { bn: RichTextContent; en: RichTextContent };

const emptyLocalized = (): LocalizedObject => ({ bn: "", en: "" });

const emptySection = (type: SectionKind = "explanation"): ContentSection => {
  if (type === "code") return { type, code: "", language: "javascript" };
  if (type === "image") return { type, src: "", alt: "", width: "", height: "", caption: emptyLocalized() };
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
        <ImageSectionEditor section={section} onChange={onChange} />
      )}
    </div>
  );
}

function ImageSectionEditor({ section, onChange }: {
  section: Extract<ContentSection, { type: "image" }>;
  onChange: (section: ContentSection) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [remoteUrl, setRemoteUrl] = useState("");

  const compressImageForUpload = async (file: File): Promise<{ file: File; originalBytes: number; compressedBytes: number }> => {
    // Keep vector images untouched; raster images are resized/compressed before
    // they ever reach ImageKit so large originals do not consume storage.
    if (file.type === "image/svg+xml" || file.type === "image/gif") {
      return { file, originalBytes: file.size, compressedBytes: file.size };
    }

    const bitmap = await createImageBitmap(file);
    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      throw new Error("Could not prepare image for upload");
    }

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.80)
    );

    if (!blob) {
      throw new Error("Could not compress image");
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    const optimizedFile = new File([blob], `${baseName}.webp`, { type: "image/webp" });
    return {
      file: optimizedFile,
      originalBytes: file.size,
      compressedBytes: optimizedFile.size,
    };
  };

  const uploadAsset = async (fileOrUrl: File | string, fileName: string) => {
    setUploading(true);
    setUploadError("");
    try {
      const auth = await getImageKitAuth();
      let uploadFile: File | string = fileOrUrl;
      let uploadFileName = fileName;

      if (fileOrUrl instanceof File) {
        const optimized = await compressImageForUpload(fileOrUrl);
        uploadFile = optimized.file;
        uploadFileName = optimized.file.name;
      }

      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("fileName", uploadFileName);
      formData.append("publicKey", auth.publicKey);
      formData.append("signature", auth.signature);
      formData.append("expire", String(auth.expire));
      formData.append("token", auth.token);
      formData.append("folder", "/syntaxhub");

      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { url?: string; message?: string; error?: string };
      if (!response.ok || !result.url) {
        throw new Error(result.message || result.error || "Image upload failed");
      }

      onChange({ ...section, src: result.url });
      setRemoteUrl("");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    void uploadAsset(file, file.name);
    event.target.value = "";
  };

  const handleRemoteUpload = () => {
    const url = remoteUrl.trim();
    if (!url) return;
    try {
      const parsed = new URL(url);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error();
      const rawName = parsed.pathname.split("/").filter(Boolean).pop() || `image-${Date.now()}.jpg`;
      const fileName = rawName.split("?")[0] || `image-${Date.now()}.jpg`;
      void uploadAsset(url, fileName);
    } catch {
      setUploadError("Please enter a valid public http(s) image URL.");
    }
  };

  return (
    <div className="admin-form-grid">
      <div className="cms-full cms-image-upload-box">
        <span className="admin-field-label">Image</span>
        <div className="cms-image-upload-actions">
          <label className="admin-small-button cms-file-button">
            {uploading ? "Uploading..." : "Upload Image"}
            <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
          </label>
          <span className="cms-image-or">or</span>
          <input value={remoteUrl} onChange={(e) => setRemoteUrl(e.target.value)} placeholder="Paste public image URL" disabled={uploading} />
          <button type="button" className="admin-small-button" onClick={handleRemoteUpload} disabled={uploading || !remoteUrl.trim()}>Upload URL</button>
        </div>
        {uploadError && <p className="cms-image-error">{uploadError}</p>}
      </div>
      <label>Image URL<input value={section.src} onChange={(e) => onChange({ ...section, src: e.target.value })} placeholder="https://..." /></label>
      <label>Alt text<input value={section.alt} onChange={(e) => onChange({ ...section, alt: e.target.value })} /></label>
      <label>Width<input value={section.width ?? ""} onChange={(e) => onChange({ ...section, width: e.target.value })} placeholder="e.g. 800px, 70%, auto" /></label>
      <label>Height<input value={section.height ?? ""} onChange={(e) => onChange({ ...section, height: e.target.value })} placeholder="e.g. 450px, auto" /></label>
      <div className="cms-full"><span className="admin-field-label">Caption</span><LocalizedFields value={section.caption ?? emptyLocalized()} onChange={(caption) => onChange({ ...section, caption })} /></div>
      {section.src && (
        <div className="cms-full cms-image-preview-wrap">
          <span className="admin-field-label">Preview</span>
          <img
            className="cms-image-preview"
            src={section.src}
            alt={section.alt || "Preview"}
            style={{
              width: section.width || undefined,
              height: section.height || undefined,
            }}
          />
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
        <label className="cms-full">Topics (comma separated)<input value={(Array.isArray(draft.topics) ? draft.topics : []).join(", ")} onChange={(e) => updateProblem({ topics: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></label>
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

function resolveCourseReference(
  courses: AdminCourse[],
  ref: { _id?: string; id?: string; courseId?: string; slug?: string } | null | undefined,
): AdminCourse | null {
  if (!ref) return null;
  const id = String(ref._id ?? ref.id ?? ref.courseId ?? "");
  const slug = String(ref.slug ?? "");
  return courses.find((course) => course._id === id)
    ?? courses.find((course) => course.slug === slug)
    ?? courses.find((course) => course.slug === id)
    ?? null;
}

const safeTopics = (course: AdminCourse | null | undefined): Topic[] => {
  if (!course) return [];
  const content = course.content && typeof course.content === "object" ? course.content as Record<string, unknown> : {};
  return Array.isArray(course.topics)
    ? course.topics
    : Array.isArray(content.topics)
      ? content.topics as Topic[]
      : [];
};

const safeProblemCategories = (course: AdminCourse | null | undefined): ProblemCategory[] => {
  if (!course) return [];
  const content = course.content && typeof course.content === "object" ? course.content as Record<string, unknown> : {};
  const raw = Array.isArray(course.problemSolvingCategories)
    ? course.problemSolvingCategories
    : Array.isArray(content.categories)
      ? content.categories as ProblemCategory[]
      : [];
  return raw.map((category) => ({ ...category, problems: Array.isArray(category.problems) ? category.problems : [] }));
};

const safeNestedItems = (course: AdminCourse | null | undefined) => {
  if (!course || course.type !== "nested") return [];
  const content = course.content && typeof course.content === "object" ? course.content as Record<string, unknown> : {};
  const raw = Array.isArray(content.courses)
    ? content.courses
    : Array.isArray((course as any).nestedCourses)
      ? (course as any).nestedCourses
      : [];

  return (raw as Array<Record<string, unknown>>).map((item, index) => {
    const id = String(item?._id ?? item?.id ?? item?.courseId ?? item?.slug ?? `nested-${index}`);
    return {
      _id: id,
      id,
      courseId: typeof item?.courseId === "string" ? item.courseId : undefined,
      type: item?.type as CourseKind | undefined,
      title: String(item?.title ?? "Untitled Course"),
      slug: String(item?.slug ?? id),
      category: typeof item?.category === "string" ? item.category : undefined,
      description: typeof item?.description === "string" ? item.description : undefined,
      level: typeof item?.level === "string" ? item.level : undefined,
      topicsCount: Number.isFinite(Number(item?.topicsCount)) ? Number(item.topicsCount) : undefined,
    };
  });
};


const cloneCourseContentForCopy = (type: CourseKind, rawContent: unknown, rawLanguages?: unknown[]) => {
  const content = rawContent && typeof rawContent === "object" ? JSON.parse(JSON.stringify(rawContent)) : {};
  const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const cloneLocalized = (value: unknown) => {
    if (value && typeof value === "object") return JSON.parse(JSON.stringify(value));
    return value;
  };
  const cloneSections = (sections: unknown) => Array.isArray(sections) ? sections.map((section) => ({ ...(section as Record<string, unknown>), ...(section && typeof section === "object" && "items" in (section as Record<string, unknown>) && Array.isArray((section as Record<string, unknown>).items) ? { items: ((section as Record<string, unknown>).items as unknown[]).map((item) => cloneLocalized(item)) } : {}), ...(section && typeof section === "object" && "content" in (section as Record<string, unknown>) ? { content: cloneLocalized((section as Record<string, unknown>).content) } : {}) })) : [];

  if (type === "single-language") {
    const topics = Array.isArray((content as any).topics) ? (content as any).topics : [];
    (content as any).topics = topics.map((topic: any, index: number) => ({
      ...topic,
      _id: newId("topic"),
      order: index + 1,
      title: cloneLocalized(topic.title),
      sections: cloneSections(topic.sections),
      subtopics: Array.isArray(topic.subtopics) ? topic.subtopics.map((subtopic: any, subIndex: number) => ({
        ...subtopic,
        _id: newId("subtopic"),
        order: subIndex + 1,
        title: cloneLocalized(subtopic.title),
        sections: cloneSections(subtopic.sections),
      })) : [],
    }));
    return { content, languages: undefined };
  }

  if (type === "multi-language") {
    const sourceLanguages = Array.isArray(rawLanguages) && rawLanguages.length
      ? rawLanguages
      : (Array.isArray((content as any).languages) ? (content as any).languages : []);
    const languages = sourceLanguages.map((language: any) => ({
      ...language,
      id: newId("language"),
      topics: Array.isArray(language.topics) ? language.topics.map((topic: any, index: number) => ({
        ...topic,
        _id: newId("topic"),
        order: index + 1,
        title: cloneLocalized(topic.title),
        sections: cloneSections(topic.sections),
        subtopics: Array.isArray(topic.subtopics) ? topic.subtopics.map((subtopic: any, subIndex: number) => ({
          ...subtopic,
          _id: newId("subtopic"),
          order: subIndex + 1,
          title: cloneLocalized(subtopic.title),
          sections: cloneSections(subtopic.sections),
        })) : [],
      })) : [],
    }));
    (content as any).languages = languages;
    return { content, languages };
  }

  if (type === "problem-solving") {
    const categories = Array.isArray((content as any).categories)
      ? (content as any).categories
      : Array.isArray((content as any).problemSolvingCategories)
        ? (content as any).problemSolvingCategories
        : [];
    (content as any).categories = categories.map((category: any, index: number) => ({
      ...category,
      _id: newId("category"),
      order: index + 1,
      title: cloneLocalized(category.title),
      description: cloneLocalized(category.description),
      problems: Array.isArray(category.problems) ? category.problems.map((problem: any, problemIndex: number) => ({
        ...problem,
        _id: newId("problem"),
        order: problemIndex + 1,
        title: cloneLocalized(problem.title),
        topics: Array.isArray(problem.topics) ? [...problem.topics] : [],
        problem: problem.problem ? {
          ...problem.problem,
          title: cloneLocalized(problem.problem.title),
          description: cloneLocalized(problem.problem.description),
          examples: Array.isArray(problem.problem.examples) ? problem.problem.examples.map((example: any) => ({ ...example, explanation: cloneLocalized(example.explanation) })) : [],
          constraints: Array.isArray(problem.problem.constraints) ? problem.problem.constraints.map((item: any) => cloneLocalized(item)) : [],
        } : problem.problem,
        approach: problem.approach ? { ...problem.approach, title: cloneLocalized(problem.approach.title), sections: cloneSections(problem.approach.sections) } : problem.approach,
        solutions: Array.isArray(problem.solutions) ? problem.solutions.map((solution: any) => ({ ...solution })) : [],
      })) : [],
    }));
    delete (content as any).problemSolvingCategories;
    return { content, languages: undefined };
  }

  // Nested course copies its learning-path structure. Child course references
  // intentionally remain intact because they point to real course documents.
  const nested = Array.isArray((content as any).courses) ? (content as any).courses : [];
  (content as any).courses = nested.map((item: any, index: number) => ({ ...item, order: index + 1 }));
  return { content, languages: undefined };
};

function AdminDashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "courses" | "content">("overview");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedLanguageId, setSelectedLanguageId] = useState("");
  const [selectedNestedCourseId, setSelectedNestedCourseId] = useState("");
  const [selectedNestedGrandchildId, setSelectedNestedGrandchildId] = useState("");
  const [nestedCreateMode, setNestedCreateMode] = useState(false);
  const [nestedCreateParentId, setNestedCreateParentId] = useState<string | null>(null);
  const [editingTopic, setEditingTopic] = useState<EditableTopic | null>(null);
  const [editingSubtopic, setEditingSubtopic] = useState<Subtopic | null>(null);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [selectedProblemCategoryId, setSelectedProblemCategoryId] = useState<string | null>(null);
  const [savingContent, setSavingContent] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseForm>({ title: "", slug: "", category: "", type: "single-language", description: "", level: "Beginner", order: "0", isPublished: true, isTopLevel: true, content: JSON.stringify({ topics: [] }, null, 2), copySourceCourseId: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true); setError("");
    const [overviewResult, usersResult, coursesResult] = await Promise.allSettled([
      getAdminOverview(),
      getAdminUsers(),
      getAdminCourses(),
    ]);

    const failures: string[] = [];
    if (overviewResult.status === "fulfilled") setOverview(overviewResult.value);
    else failures.push("overview");

    if (usersResult.status === "fulfilled") setUsers(usersResult.value);
    else failures.push("users");

    if (coursesResult.status === "fulfilled") {
      const nextCourses = Array.isArray(coursesResult.value) ? coursesResult.value : [];
      setCourses(nextCourses);
      setSelectedCourseId((current) =>
        nextCourses.some((course) => course._id === current) ? current : (nextCourses[0]?._id ?? "")
      );
    } else {
      failures.push("courses");
      setCourses([]);
    }

    if (failures.includes("courses")) {
      const reason = coursesResult.status === "rejected" ? coursesResult.reason : null;
      setError(reason instanceof Error ? reason.message : "Failed to load courses. Check that the backend is running and your admin session is valid.");
    } else if (failures.length) {
      // A broken overview/users request must not prevent Content Management from working.
      setError("");
    }
    setLoading(false);
  }, []);
  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const selectedCourse = useMemo(() => courses.find((course) => course._id === selectedCourseId) ?? null, [courses, selectedCourseId]);
  const courseContent = useMemo(() => {
    const raw = selectedCourse?.content;
    return raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  }, [selectedCourse]);
  const languages = useMemo<CourseLanguage[]>(() => {
    if (selectedCourse?.type !== "multi-language") return [];
    return (selectedCourse.languages?.length ? selectedCourse.languages : courseContent.languages as CourseLanguage[] | undefined) ?? [];
  }, [selectedCourse, courseContent]);
  const activeLanguage = languages.find((language) => language.id === selectedLanguageId) ?? languages[0];
  const topicList: Topic[] = selectedCourse?.type === "single-language"
    ? safeTopics(selectedCourse)
    : selectedCourse?.type === "multi-language"
      ? (activeLanguage?.topics ?? [])
      : [];

  const nestedCourseItems = useMemo(() => safeNestedItems(selectedCourse), [selectedCourse]);


  const selectedNestedChild = useMemo(() => {
    if (!selectedNestedCourseId) return null;
    return courses.find((course) => course._id === selectedNestedCourseId)
      ?? courses.find((course) => course.slug === selectedNestedCourseId)
      ?? nestedCourseItems.map((item) => ({ item, course: resolveCourseReference(courses, item) })).find(({ item }) => String(item._id ?? item.id ?? item.courseId ?? item.slug ?? "") === selectedNestedCourseId)?.course
      ?? null;
  }, [courses, selectedNestedCourseId, nestedCourseItems]);

  const getNestedItems = (course: AdminCourse | null) => safeNestedItems(course);

  const nestedChildItems = useMemo(() => getNestedItems(selectedNestedChild), [selectedNestedChild]);
  const selectedNestedGrandchild = useMemo(() => {
    if (!selectedNestedGrandchildId) return null;
    return courses.find((course) => course._id === selectedNestedGrandchildId)
      ?? courses.find((course) => course.slug === selectedNestedGrandchildId)
      ?? nestedChildItems
        .filter((item) => String(item._id ?? item.id ?? item.courseId ?? item.slug ?? "") === selectedNestedGrandchildId)
        .map((item) => resolveCourseReference(courses, item))[0]
      ?? null;
  }, [courses, selectedNestedGrandchildId, nestedChildItems]);

  const nestedChildTopics = useMemo<Topic[]>(() => {
    if (!selectedNestedChild || selectedNestedChild.type !== "single-language") return [];
    const raw = selectedNestedChild.content;
    if (!raw || typeof raw !== "object") return selectedNestedChild.topics ?? [];
    return ((selectedNestedChild.topics?.length ? selectedNestedChild.topics : (raw as any).topics) ?? []) as Topic[];
  }, [selectedNestedChild]);

  const nestedGrandchildTopics = useMemo<Topic[]>(() => {
    if (!selectedNestedGrandchild || selectedNestedGrandchild.type !== "single-language") return [];
    const raw = selectedNestedGrandchild.content;
    if (!raw || typeof raw !== "object") return selectedNestedGrandchild.topics ?? [];
    return ((selectedNestedGrandchild.topics?.length ? selectedNestedGrandchild.topics : (raw as any).topics) ?? []) as Topic[];
  }, [selectedNestedGrandchild]);
  const problemCategories: ProblemCategory[] = selectedCourse?.type === "problem-solving"
    ? safeProblemCategories(selectedCourse)
    : [];

  useEffect(() => {
    if (languages[0] && !languages.some((x) => x.id === selectedLanguageId)) setSelectedLanguageId(languages[0].id);
  }, [selectedCourseId, languages, selectedLanguageId]);

  useEffect(() => {
    if (selectedCourse?.type !== "nested") {
      setSelectedNestedCourseId("");
      setSelectedNestedGrandchildId("");
      setEditingTopic(null);
      return;
    }
    if (nestedCourseItems[0] && !nestedCourseItems.some((item) => item._id === selectedNestedCourseId)) {
      setSelectedNestedCourseId(String(nestedCourseItems[0]._id));
    }
  }, [selectedCourseId, selectedCourse?.type, nestedCourseItems, selectedNestedCourseId]);

  useEffect(() => {
    if (selectedNestedChild?.type !== "nested") {
      setSelectedNestedGrandchildId("");
      return;
    }
    if (nestedChildItems[0] && !nestedChildItems.some((item) => item._id === selectedNestedGrandchildId)) {
      setSelectedNestedGrandchildId(String(nestedChildItems[0]._id));
    }
  }, [selectedNestedChild, nestedChildItems, selectedNestedGrandchildId]);

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

  const saveCourseItems = async (parent: AdminCourse, items: Array<{ _id: string; type?: CourseKind; title: string; slug: string; category?: string; description?: string; level?: string; topicsCount?: number }>) => {
    setSavingContent(true); setError(""); setNotice("");
    try {
      const raw = parent.content && typeof parent.content === "object" ? parent.content as Record<string, unknown> : {};
      const updated = await updateAdminCourse(parent._id, { content: { ...raw, courses: items } });
      setCourses((current) => current.map((course) => course._id === updated._id ? updated : course));
      setNotice(`Learning path \"${parent.title}\" updated successfully.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update learning path");
    } finally { setSavingContent(false); }
  };

  const saveNestedChildTopics = async (nextTopics: Topic[]) => {
    if (!selectedNestedChild || selectedNestedChild.type !== "single-language") return;
    setSavingContent(true); setError(""); setNotice("");
    try {
      const raw = selectedNestedChild.content && typeof selectedNestedChild.content === "object" ? selectedNestedChild.content as Record<string, unknown> : {};
      const updated = await updateAdminCourse(selectedNestedChild._id, { content: { ...raw, topics: nextTopics } });
      setCourses((current) => current.map((course) => course._id === updated._id ? updated : course));
      if (selectedCourse?.type === "nested") {
        const nextNestedItems = nestedCourseItems.map((item) => item._id === updated._id ? { ...item, title: updated.title, slug: updated.slug, category: updated.category, description: updated.description, level: updated.level, topicsCount: nextTopics.length } : item);
        await saveCourseContent({ ...courseContent, courses: nextNestedItems });
      }
      setNotice("Nested course topic saved successfully.");
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to save nested course topic"); }
    finally { setSavingContent(false); }
  };

  const saveNestedGrandchildTopics = async (nextTopics: Topic[]) => {
    if (!selectedNestedGrandchild || selectedNestedGrandchild.type !== "single-language" || !selectedNestedChild || selectedNestedChild.type !== "nested") return;
    setSavingContent(true); setError(""); setNotice("");
    try {
      const raw = selectedNestedGrandchild.content && typeof selectedNestedGrandchild.content === "object" ? selectedNestedGrandchild.content as Record<string, unknown> : {};
      const updated = await updateAdminCourse(selectedNestedGrandchild._id, { content: { ...raw, topics: nextTopics } });
      setCourses((current) => current.map((course) => course._id === updated._id ? updated : course));
      const nextItems = nestedChildItems.map((item) => item._id === updated._id ? { ...item, title: updated.title, slug: updated.slug, category: updated.category, description: updated.description, level: updated.level, topicsCount: nextTopics.length } : item);
      await saveCourseItems(selectedNestedChild, nextItems);

      // Keep the top-level learning path metadata in sync as well.
      if (selectedCourse?.type === "nested") {
        const updatedChildItem = { ...courseItem(updated), topicsCount: nextTopics.length };
        const nextTopLevelItems = nestedCourseItems.map((item) => item._id === updated._id ? updatedChildItem : item);
        await saveCourseContent({ ...courseContent, courses: nextTopLevelItems });
      }
      setNotice("Course topic saved successfully.");
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to save course topic"); }
    finally { setSavingContent(false); }
  };

  const deleteTopic = (topicId: string) => {
    if (!selectedCourse) return;
    if (!window.confirm("Delete this topic and all of its subtopics?")) return;
    saveTopics(topicList.filter((topic) => topic._id !== topicId).map((topic, index) => ({ ...topic, order: index + 1 })));
    if (editingTopic?._id === topicId) setEditingTopic(null);
  };

  const deleteNestedChildTopic = (topicId: string) => {
    if (!selectedNestedChild || selectedNestedChild.type !== "single-language") return;
    if (!window.confirm("Delete this topic and all of its subtopics?")) return;
    void saveNestedChildTopics(nestedChildTopics.filter((topic) => topic._id !== topicId).map((topic, index) => ({ ...topic, order: index + 1 })));
    if (editingTopic?._id === topicId) setEditingTopic(null);
  };

  const deleteNestedGrandchildTopic = (topicId: string) => {
    if (!selectedNestedGrandchild || selectedNestedGrandchild.type !== "single-language") return;
    if (!window.confirm("Delete this topic and all of its subtopics?")) return;
    void saveNestedGrandchildTopics(nestedGrandchildTopics.filter((topic) => topic._id !== topicId).map((topic, index) => ({ ...topic, order: index + 1 })));
    if (editingTopic?._id === topicId) setEditingTopic(null);
  };

  const addTopic = () => { setEditingSubtopic(null); setEditingTopic(emptyTopic(activeLanguage?.id ?? "javascript")); };
  const addNestedChildTopic = () => { setEditingSubtopic(null); setEditingTopic(emptyTopic("javascript")); };
  const addNestedGrandchildTopic = () => { setEditingSubtopic(null); setEditingTopic(emptyTopic("javascript")); };
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

  const saveNestedChildTopic = (saved: EditableTopic) => {
    if (!selectedNestedChild || selectedNestedChild.type !== "single-language") return;
    const index = nestedChildTopics.findIndex((topic) => topic._id === saved._id);
    const next = index >= 0 ? nestedChildTopics.map((topic, i) => i === index ? saved as Topic : topic) : [...nestedChildTopics, { ...(saved as Topic), order: nestedChildTopics.length + 1 }];
    void saveNestedChildTopics(next);
    setEditingTopic(null);
  };

  const saveNestedGrandchildTopic = (saved: EditableTopic) => {
    if (!selectedNestedGrandchild || selectedNestedGrandchild.type !== "single-language") return;
    const index = nestedGrandchildTopics.findIndex((topic) => topic._id === saved._id);
    const next = index >= 0 ? nestedGrandchildTopics.map((topic, i) => i === index ? saved as Topic : topic) : [...nestedGrandchildTopics, { ...(saved as Topic), order: nestedGrandchildTopics.length + 1 }];
    void saveNestedGrandchildTopics(next);
    setEditingTopic(null);
  };

  const getAdminContentCount = (child: AdminCourse) => {
    if (child.type === "nested") return getNestedItems(child).length;
    if (child.type === "problem-solving") return safeProblemCategories(child).reduce((sum, category) => sum + (Array.isArray(category.problems) ? category.problems.length : 0), 0);
    if (child.type === "multi-language") {
      const content = child.content && typeof child.content === "object" ? child.content as Record<string, unknown> : {};
      const languages = Array.isArray(child.languages) && child.languages.length
        ? child.languages
        : Array.isArray(content.languages) ? content.languages as CourseLanguage[] : [];
      return languages.reduce((sum, language) => sum + (Array.isArray(language.topics) ? language.topics.length : 0), 0);
    }
    return safeTopics(child).length;
  };

  const courseItem = (child: AdminCourse) => ({
    _id: child._id, type: child.type, title: child.title, slug: child.slug, category: child.category, description: child.description, level: child.level,
    topicsCount: getAdminContentCount(child),
  });

  const addNestedCourse = async (parent: AdminCourse, courseId: string) => {
    const child = courses.find((course) => course._id === courseId);
    if (parent.type !== "nested" || !child || child._id === parent._id) return;
    const items = getNestedItems(parent);
    if (items.some((item) => item._id === child._id)) {
      if (parent._id === selectedCourse?._id) setSelectedNestedCourseId(child._id);
      else setSelectedNestedGrandchildId(child._id);
      return;
    }
    await saveCourseItems(parent, [...items, courseItem(child)]);
    if (parent._id === selectedCourse?._id) setSelectedNestedCourseId(child._id);
    else setSelectedNestedGrandchildId(child._id);
  };

  const removeNestedCourse = async (parent: AdminCourse, id: string) => {
    if (!window.confirm("Remove this course from the learning path? The course itself will not be deleted.")) return;
    await saveCourseItems(parent, getNestedItems(parent).filter((item) => item._id !== id));
    if (parent._id === selectedCourse?._id && selectedNestedCourseId === id) { setSelectedNestedCourseId(""); setSelectedNestedGrandchildId(""); }
    if (parent._id === selectedNestedChild?._id && selectedNestedGrandchildId === id) setSelectedNestedGrandchildId("");
  };


  const saveProblems = (categories: ProblemCategory[]) => {
    if (selectedCourse) void saveCourseContent({ ...courseContent, categories });
  };
  const addCategory = () => { const next = [...problemCategories, { ...emptyCategory(), order: problemCategories.length + 1 }]; saveProblems(next); };
  const addProblem = (category: ProblemCategory) => { setSelectedProblemCategoryId(category._id); setEditingCategoryId(category._id); setEditingProblem({ ...emptyProblem(), order: (Array.isArray(category.problems) ? category.problems.length : 0) + 1 }); };
  const editProblem = (category: ProblemCategory, problem: Problem) => { setSelectedProblemCategoryId(category._id); setEditingCategoryId(category._id); setEditingProblem(problem); };
  const saveProblem = (saved: Problem) => { if (!editingCategoryId) return; const next = problemCategories.map((category) => category._id === editingCategoryId ? { ...category, problems: Array.isArray(category.problems) && category.problems.some((p) => p._id === saved._id) ? category.problems.map((p) => p._id === saved._id ? saved : p) : [...(Array.isArray(category.problems) ? category.problems : []), saved] } : category); saveProblems(next); setEditingProblem(null); setEditingCategoryId(null); };
  const deleteProblem = (categoryId: string, problemId: string) => {
    if (!window.confirm("Delete this problem?")) return;
    const next = problemCategories.map((category) => category._id === categoryId
      ? { ...category, problems: (Array.isArray(category.problems) ? category.problems : []).filter((problem) => problem._id !== problemId).map((problem, index) => ({ ...problem, order: index + 1 })) }
      : category
    );
    saveProblems(next);
    if (editingProblem?._id === problemId) { setEditingProblem(null); setEditingCategoryId(null); }
  };

  const deleteCategory = (id: string) => { if (!window.confirm("Delete this category and its problems?")) return; saveProblems(problemCategories.filter((x) => x._id !== id).map((x, i) => ({ ...x, order: i + 1 }))); };

  const openCreateCourse = (type: CourseKind = "single-language", isTopLevel = true) => {
    setEditingId(null);
    const defaultContent = type === "nested" ? { courses: [] } : type === "problem-solving" ? { categories: [] } : type === "multi-language" ? { languages: [] } : { topics: [] };
    setForm({ title: "", slug: "", category: "", type, description: "", level: "Beginner", order: "0", isPublished: true, isTopLevel, content: JSON.stringify(defaultContent, null, 2), copySourceCourseId: "" });
    setFormOpen(true);
  };

  const openCreateNestedChild = (parentId: string) => {
    setNestedCreateMode(true);
    setNestedCreateParentId(parentId);
    // A learning path's children are normal courses by default. The admin can
    // still change the type to nested/problem-solving/multi-language in the form.
    openCreateCourse("single-language", false);
  };
  const openEditCourse = (course: AdminCourse) => {
    const rawContent = course.content && typeof course.content === "object" ? course.content : {};
    const fallbackContent = course.type === "single-language"
      ? { topics: course.topics ?? (rawContent as any).topics ?? [] }
      : course.type === "multi-language"
        ? { languages: course.languages ?? (rawContent as any).languages ?? [] }
        : course.type === "nested"
          ? { courses: (rawContent as any).courses ?? [] }
          : { categories: course.problemSolvingCategories ?? (rawContent as any).categories ?? [] };
    setEditingId(course._id);
    setForm({ title: course.title, slug: course.slug, category: course.category, type: course.type, description: course.description, level: course.level, order: String(course.order), isPublished: course.isPublished, isTopLevel: course.isTopLevel !== false, content: JSON.stringify(fallbackContent, null, 2), copySourceCourseId: "" });
    setFormOpen(true);
  };
  const submitCourse = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const content = JSON.parse(form.content);
      const payload = { title: form.title.trim(), slug: form.slug.trim().toLowerCase(), category: form.category.trim(), type: form.type, description: form.description.trim(), level: form.level.trim(), order: Number(form.order) || 0, isPublished: form.isPublished, isTopLevel: form.isTopLevel, content, ...(form.type === "multi-language" && content.languages ? { languages: content.languages } : {}) };
      let savedCourse: AdminCourse;
      if (editingId) savedCourse = await updateAdminCourse(editingId, payload);
      else savedCourse = await createAdminCourse(payload);
      setFormOpen(false);
      if (nestedCreateMode && !editingId && nestedCreateParentId) {
        const parent = courses.find((course) => course._id === nestedCreateParentId);
        if (!parent || parent.type !== "nested") throw new Error("Nested parent course not found");
        const updatedParent = await updateAdminCourse(parent._id, { content: { ...(parent.content && typeof parent.content === "object" ? parent.content as Record<string, unknown> : {}), courses: [...getNestedItems(parent), courseItem(savedCourse)] } });
        setCourses((current) => current.map((course) => course._id === savedCourse._id ? savedCourse : course._id === updatedParent._id ? updatedParent : course));
        if (parent._id === selectedCourse?._id) {
          setSelectedNestedCourseId(savedCourse._id);
          setSelectedNestedGrandchildId("");
        } else {
          setSelectedNestedGrandchildId(savedCourse._id);
        }
        setNotice(`Course "${savedCourse.title}" created and added to ${parent.title}.`);
      } else {
        await loadDashboard();
      }
      setNestedCreateMode(false);
      setNestedCreateParentId(null);
    } catch (err) { setError(err instanceof Error ? err.message : "Invalid course content"); }
  };

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
          {activeTab === "courses" && <section className="admin-panel-card"><div className="admin-section-heading"><div><h2>Courses</h2><p>Manage metadata and publication status. Detailed content is managed from Content Management.</p></div><div className="admin-course-actions"><button type="button" className="admin-primary-button" onClick={() => openCreateCourse()}>+ Add Course</button><button type="button" className="admin-small-button" onClick={() => openCreateCourse()}>Copy Existing Course</button></div></div>{formOpen && <form className="admin-course-form" onSubmit={submitCourse}><div className="admin-form-heading"><h3>{editingId ? "Edit Course" : "Create Course"}</h3><button type="button" onClick={() => { setFormOpen(false); setNestedCreateMode(false); setNestedCreateParentId(null); }}>Cancel</button></div>{!editingId && <label className="cms-copy-course-field">Copy all data from existing course<select value={form.copySourceCourseId} onChange={(e) => { const source = courses.find((course) => course._id === e.target.value); if (!source) { setForm({ ...form, copySourceCourseId: "" }); return; } const cloned = cloneCourseContentForCopy(source.type, source.content, source.languages); setForm({ ...form, title: `${source.title} Copy`, slug: `${source.slug}-copy-${Date.now().toString(36)}`.toLowerCase(), category: source.category, type: source.type, description: source.description, level: source.level, content: JSON.stringify(cloned.content, null, 2), copySourceCourseId: source._id }); }}><option value="">Select existing course...</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.title} — {course.type}</option>)}</select></label>}<div className="admin-form-grid"><label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label>Slug<input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></label><label>Category<input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label><label>Level<input required value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} /></label><label>Type<select value={form.type} onChange={(e) => {
  const nextType = e.target.value as CourseKind;
  const defaultContent = nextType === "nested" ? { courses: [] } : nextType === "problem-solving" ? { categories: [] } : nextType === "multi-language" ? { languages: [] } : { topics: [] };
  setForm({ ...form, type: nextType, content: JSON.stringify(defaultContent, null, 2) });
}}><option value="single-language">Single language</option><option value="multi-language">Multi language</option><option value="problem-solving">Problem solving</option><option value="nested">Nested course</option></select></label><label>Order<input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></label></div><label>Description<textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><label>Initial Content JSON<textarea className="admin-json-input" rows={12} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></label><label className="admin-checkbox"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Published</label><button className="admin-primary-button" type="submit">{editingId ? "Save Changes" : "Create Course"}</button></form>}<div className="admin-course-list">{courses.map((course) => <article className="admin-course-row" key={course._id}><div><h3>{course.title}</h3><p>/{course.slug} · {course.category} · {course.level}</p></div><div className="admin-course-actions"><span className={`admin-publish ${course.isPublished ? "published" : "draft"}`}>{course.isPublished ? "Published" : "Draft"}</span><button type="button" className="admin-small-button" onClick={() => openEditCourse(course)}>Edit</button><button type="button" className="admin-danger-button" onClick={() => void deleteCourse(course)}>Delete</button></div></article>)}</div></section>}

          {activeTab === "content" && <section className="admin-panel-card cms-page">
            <div className="admin-section-heading"><div><h2>Content Management</h2><p>Choose a course, select a topic or problem from the left, and edit its existing content on the right.</p></div></div>
            <div className="cms-course-picker">
              <label>Course<select value={selectedCourseId} onChange={(e) => { setSelectedCourseId(e.target.value); setSelectedNestedCourseId(""); setSelectedNestedGrandchildId(""); setEditingTopic(null); setEditingProblem(null); setEditingCategoryId(null); setSelectedProblemCategoryId(null); setEditingSubtopic(null); }}>
                <option value="">Select a course</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.title} — {course.type}</option>)}
              </select></label>
              {selectedCourse?.type === "multi-language" && <label>Programming Language<select value={activeLanguage?.id ?? ""} onChange={(e) => { setSelectedLanguageId(e.target.value); setEditingTopic(null); }}>{languages.map((language) => <option key={language.id} value={language.id}>{language.name}</option>)}</select></label>}
            </div>

            {formOpen && activeTab === "content" && (
              <form className="admin-course-form cms-inline-course-form" onSubmit={submitCourse}>
                <div className="admin-form-heading"><h3>{editingId ? "Edit Course" : "Create Course"}</h3><button type="button" onClick={() => { setFormOpen(false); setNestedCreateMode(false); setNestedCreateParentId(null); }}>Cancel</button></div>
                <div className="admin-form-grid">
                  <label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
                  <label>Slug<input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></label>
                  <label>Category<input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
                  <label>Level<input required value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} /></label>
                  <label>Type<select value={form.type} onChange={(e) => { const nextType = e.target.value as CourseKind; const defaultContent = nextType === "nested" ? { courses: [] } : nextType === "problem-solving" ? { categories: [] } : nextType === "multi-language" ? { languages: [] } : { topics: [] }; setForm({ ...form, type: nextType, content: JSON.stringify(defaultContent, null, 2) }); }}><option value="single-language">Single language</option><option value="multi-language">Multi language</option><option value="problem-solving">Problem solving</option><option value="nested">Nested course</option></select></label>
                  <label>Order<input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></label>
                </div>
                <label>Description<textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
                <label>Initial Content JSON<textarea className="admin-json-input" rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></label>
                <label className="admin-checkbox"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Published</label>
                <button className="admin-primary-button" type="submit">{editingId ? "Save Changes" : "Create Course"}</button>
              </form>
            )}

            {!selectedCourse ? <div className="admin-empty">Select a course to manage its content.</div> : selectedCourse.type === "problem-solving" ? (
              <div className="cms-workspace cms-problem-workspace">
                <aside className="cms-sidebar">
                  <div className="cms-sidebar-head"><div><strong>Categories</strong><small>{problemCategories.length} categories · {problemCategories.reduce((sum, c) => sum + (Array.isArray(c.problems) ? c.problems.length : 0), 0)} problems</small></div><button type="button" className="admin-small-button" onClick={addCategory}>+ Category</button></div>
                  <div className="cms-category-list">
                    {problemCategories.map((category) => {
                      const isOpen = selectedProblemCategoryId === category._id;
                      const problems = Array.isArray(category.problems) ? category.problems : [];
                      return (
                        <div className={`cms-problem-category ${isOpen ? "open" : ""}`} key={category._id}>
                          <div className="cms-category-toggle-row">
                            <button type="button" className="cms-category-toggle" onClick={() => { setSelectedProblemCategoryId(isOpen ? null : category._id); setEditingProblem(null); setEditingCategoryId(null); }}>
                              <span className="cms-category-chevron">{isOpen ? "⌄" : "›"}</span>
                              <span className="cms-category-toggle-main"><strong>{category.order}. {displayLocalized(category.title) || "Untitled Category"}</strong><small>{problems.length} {problems.length === 1 ? "problem" : "problems"}</small></span>
                            </button>
                            <button type="button" className="admin-danger-button" onClick={() => deleteCategory(category._id)}>Delete</button>
                          </div>
                          {isOpen && (
                            <div className="cms-category-problem-list">
                              {problems.length === 0 ? (
                                <div className="cms-category-empty">No problems yet.</div>
                              ) : problems.map((problem) => (
                                <div className="cms-problem-row" key={problem._id}>
                                  <button type="button" className={`cms-sidebar-item ${editingProblem?._id === problem._id ? "active" : ""}`} onClick={() => editProblem(category, problem)}>
                                    <span>{String(problem.order).padStart(2, "0")}</span><span>{displayLocalized(problem.title) || "Untitled Problem"}</span>
                                  </button>
                                  <button type="button" className="admin-danger-button" onClick={() => deleteProblem(category._id, problem._id)}>Delete</button>
                                </div>
                              ))}
                              <button type="button" className="cms-sidebar-add" onClick={() => addProblem(category)}>+ Add Problem</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </aside>
                <div className="cms-editor-pane">
                  {!editingProblem ? <div className="cms-editor-empty"><div className="cms-editor-empty-icon">📝</div><h3>{selectedProblemCategoryId ? "Select a problem" : "Select a category"}</h3><p>{selectedProblemCategoryId ? "Choose a problem from the selected category to edit it here, or use + Add Problem." : "Click a category on the left to see only its problems. Categories stay collapsed so large problem sets remain easy to manage."}</p></div> : <ProblemEditor problem={editingProblem} onSave={saveProblem} onCancel={() => { setEditingProblem(null); setEditingCategoryId(null); }} />}
                </div>
              </div>
            ) : selectedCourse.type === "nested" ? (
              <div className="cms-workspace">
                <aside className="cms-sidebar">
                  <div className="cms-sidebar-head">
                    <div><strong>{selectedNestedChild?.type === "nested" ? "Learning Paths" : "Nested Courses"}</strong><small>{nestedCourseItems.length} courses</small></div>
                    <div className="cms-nested-actions">
                      <button type="button" className="admin-small-button" onClick={() => openCreateNestedChild(selectedNestedChild?.type === "nested" ? selectedNestedChild._id : selectedCourse._id)}>+ New Course</button>
                      <select className="admin-small-button" value="" onChange={(event) => { const parent = selectedNestedChild?.type === "nested" ? selectedNestedChild : selectedCourse; void addNestedCourse(parent, event.target.value); }} aria-label="Add existing course to learning path">
                        <option value="">+ Existing</option>
                        {courses.filter((course) => { const parentId = selectedNestedChild?.type === "nested" ? selectedNestedChild._id : selectedCourse._id; const items = parentId === selectedCourse._id ? nestedCourseItems : nestedChildItems; return course._id !== parentId && !items.some((item) => item._id === course._id); }).map((course) => <option key={course._id} value={course._id}>{course.title} · {course.type}</option>)}
                      </select>
                    </div>
                  </div>
                  {nestedCourseItems.map((item, index) => {
                    const child = courses.find((course) => course._id === item._id);
                    return (
                      <div className="cms-sidebar-group" key={item._id}>
                        <div className="cms-sidebar-group-title">
                          <button type="button" className={`cms-sidebar-item cms-sidebar-topic ${selectedNestedCourseId === item._id ? "active" : ""}`} onClick={() => { setSelectedNestedCourseId(item._id); setSelectedNestedGrandchildId(""); setEditingTopic(null); }}>
                            <span>{String(index + 1).padStart(2, "0")}</span><span>{item.title}<small>{child?.type === "nested" ? `${getNestedItems(child).length} courses` : `${child?.topicsCount ?? item.topicsCount ?? 0} topics`}</small></span>
                          </button>
                          <button type="button" className="admin-danger-button" onClick={() => void removeNestedCourse(selectedCourse, item._id)}>Delete</button>
                        </div>
                      </div>
                    );
                  })}
                  {nestedCourseItems.length === 0 && <div className="cms-editor-empty" style={{ margin: "12px" }}><p>Use <strong>+ New Course</strong> to create a learning path, or <strong>+ Existing</strong> to add an existing course.</p></div>}
                </aside>
                <div className="cms-editor-pane">
                  {!selectedNestedChild ? (
                    <div className="cms-editor-empty"><div className="cms-editor-empty-icon">📚</div><h3>Select a course</h3><p>Create a learning path or add an existing course from the left.</p></div>
                  ) : selectedNestedChild.type === "nested" ? (
                    <div className="cms-editor-card">
                      <div className="admin-form-heading"><div><h3>{selectedNestedChild.title}</h3><p>Manage the courses inside this learning path.</p></div><button type="button" className="admin-small-button" onClick={() => openCreateNestedChild(selectedNestedChild._id)}>+ New Course</button></div>
                      <div className="cms-nested-actions" style={{ marginBottom: "16px" }}>
                        <select className="admin-small-button" value="" onChange={(event) => void addNestedCourse(selectedNestedChild, event.target.value)} aria-label="Add existing course">
                          <option value="">+ Add Existing Course</option>
                          {courses.filter((course) => course._id !== selectedNestedChild._id && !nestedChildItems.some((item) => item._id === course._id)).map((course) => <option key={course._id} value={course._id}>{course.title} · {course.type}</option>)}
                        </select>
                      </div>
                      {nestedChildItems.length === 0 ? <div className="cms-editor-empty"><div className="cms-editor-empty-icon">🧩</div><h3>No courses yet</h3><p>Add HTML, CSS, React, Next.js or any existing course to this learning path.</p></div> : <div className="cms-subtopics">{nestedChildItems.map((item, index) => { const child = courses.find((course) => course._id === item._id); return <div className="cms-list-row" key={item._id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.title}</strong><small>{child?.type ?? item.type}</small><button type="button" className="admin-small-button" onClick={() => { setSelectedNestedGrandchildId(item._id); setEditingTopic(null); }}>Manage</button><button type="button" className="admin-danger-button" onClick={() => void removeNestedCourse(selectedNestedChild, item._id)}>Delete</button></div>; })}</div>}
                    </div>
                  ) : selectedNestedChild.type === "single-language" ? (
                    !editingTopic ? (
                      <div className="cms-editor-card">
                        <div className="admin-form-heading"><div><h3>{selectedNestedChild.title}</h3><p>Manage the topics for this course inside the learning path.</p></div><button type="button" className="admin-small-button" onClick={addNestedChildTopic}>+ Topic</button></div>
                        {nestedChildTopics.length === 0 ? <div className="cms-editor-empty"><div className="cms-editor-empty-icon">✏️</div><h3>No topics yet</h3><p>Click <strong>+ Topic</strong> to add the first topic.</p></div> : <div className="cms-subtopics">{nestedChildTopics.map((topic, index) => <div className="cms-list-row" key={topic._id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{displayLocalized(topic.title) || "Untitled Topic"}</strong><div><button type="button" className="admin-small-button" onClick={() => editTopic(topic)}>Edit</button><button type="button" className="admin-danger-button" onClick={() => deleteNestedChildTopic(topic._id)}>Delete</button></div></div>)}</div>}
                      </div>
                    ) : (
                      <TopicEditor topic={editingTopic} onSave={saveNestedChildTopic} onCancel={() => setEditingTopic(null)} onAddSubtopic={() => setEditingSubtopic(emptySubtopic(editingTopic.language))} editingSubtopic={editingSubtopic} setEditingSubtopic={setEditingSubtopic} />
                    )
                  ) : (
                    <div className="cms-editor-empty"><div className="cms-editor-empty-icon">🧩</div><h3>{selectedNestedChild.title}</h3><p>This course is a {selectedNestedChild.type} course. Select it from the main Content Management course selector to manage its language/category structure.</p></div>
                  )}

                  {selectedNestedChild?.type === "nested" && selectedNestedGrandchild && (
                    <div className="cms-editor-card" style={{ marginTop: "18px" }}>
                      {selectedNestedGrandchild.type === "single-language" ? (!editingTopic ? (
                        <><div className="admin-form-heading"><div><h3>{selectedNestedGrandchild.title}</h3><p>Topics inside {selectedNestedChild?.title}.</p></div><button type="button" className="admin-small-button" onClick={addNestedGrandchildTopic}>+ Topic</button></div>{nestedGrandchildTopics.length === 0 ? <div className="cms-editor-empty"><h3>No topics yet</h3><p>Add the first topic to this course.</p></div> : <div className="cms-subtopics">{nestedGrandchildTopics.map((topic, index) => <div className="cms-list-row" key={topic._id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{displayLocalized(topic.title) || "Untitled Topic"}</strong><div><button type="button" className="admin-small-button" onClick={() => editTopic(topic)}>Edit</button><button type="button" className="admin-danger-button" onClick={() => deleteNestedGrandchildTopic(topic._id)}>Delete</button></div></div>)}</div>}</>
                      ) : <TopicEditor topic={editingTopic} onSave={saveNestedGrandchildTopic} onCancel={() => setEditingTopic(null)} onAddSubtopic={() => setEditingSubtopic(emptySubtopic(editingTopic.language))} editingSubtopic={editingSubtopic} setEditingSubtopic={setEditingSubtopic} />) : (
                        <div className="cms-editor-empty"><h3>{selectedNestedGrandchild.title}</h3><p>This course is a {selectedNestedGrandchild.type} course. Manage its categories/languages from the main course selector.</p></div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="cms-workspace">
                <aside className="cms-sidebar">
                  <div className="cms-sidebar-head"><div><strong>Topics</strong><small>{topicList.length} main topics</small></div><button type="button" className="admin-small-button" onClick={addTopic}>+ Topic</button></div>
                  {topicList.map((topic, index) => <div className="cms-sidebar-group" key={topic._id}>
                    <div className="cms-topic-row"><button type="button" className={`cms-sidebar-item cms-sidebar-topic ${editingTopic?._id === topic._id ? "active" : ""}`} onClick={() => editTopic(topic)}><span>{String(index + 1).padStart(2, "0")}</span><span>{displayLocalized(topic.title) || "Untitled Topic"}<small>{topic.subtopics?.length ?? 0} subtopics</small></span></button><button type="button" className="admin-danger-button" onClick={() => deleteTopic(topic._id)}>Delete</button></div>
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
