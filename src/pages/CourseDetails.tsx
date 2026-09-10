import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import CourseDetailsSkeleton from "../components/CourseDetailsSkeleton";
import ErrorState from "../components/ErrorState";
import CourseLanguageSelector from "../components/course-details/CourseLanguageSelector";
import CourseSidebar from "../components/course-details/CourseSidebar";
import CourseContentRenderer from "../components/course-details/CourseContentRenderer";
import CourseTopicNavigation from "../components/course-details/CourseTopicNavigation";
import type { ContentSource } from "../components/course-details/types";
import type { Course, CourseLanguage, LocalizedText, RichTextContent, Subtopic, Topic } from "../types/course";
import { getCourseBySlug, getCoursePreview } from "../services/courseService";
import { hasAuthToken } from "../services/authService";
import { useLanguage } from "../context/useLanguage";
import { useAuth } from "../context/useAuth";
import "./CourseDetails.css";

const text = {
  ready: { bn: "শেখা শুরু করতে প্রস্তুত?", en: "Ready to start learning?" },
  select: { bn: "শেখা শুরু করতে sidebar থেকে একটি topic নির্বাচন করুন।", en: "Select a topic from the sidebar to start learning." },
  login: { bn: "লগইন করে শেখা শুরু করুন", en: "Login to Start Learning" },
  notFound: { bn: "কোর্স পাওয়া যায়নি।", en: "Course not found." },
};

function CourseDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const authenticated = Boolean(user) || hasAuthToken();
  const [course, setCourse] = useState<Course>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>();
  const [selectedTopicSlug, setSelectedTopicSlug] = useState<string | null>(null);
  const [selectedSubtopicSlug, setSelectedSubtopicSlug] = useState<string | null>(null);

  const loadCourse = async () => {
    if (!slug) {
      setCourse(undefined);
      setError("Invalid course.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const data = authLoading
        ? await getCoursePreview(slug)
        : user
          ? await getCourseBySlug(slug)
          : await getCoursePreview(slug);
      setCourse(data);
    } catch (requestError) {
      console.error("Failed to load course:", requestError);
      setCourse(undefined);
      setError("Failed to load course.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!slug) {
        if (!cancelled) {
          setCourse(undefined);
          setError("Invalid course.");
          setLoading(false);
        }
        return;
      }

      // Wait for the auth session to be restored before deciding whether
      // to request the protected lesson content.
      if (authLoading) return;

      try {
        setLoading(true);
        setError("");

        // Guests receive only the public course preview (sidebar metadata).
        // Authenticated users receive the full course content.
        // A freshly completed login stores the token before React finishes
        // propagating the user state. Treat a valid stored token as
        // authenticated here so the course never flashes the guest state.
        const data = authenticated
          ? await getCourseBySlug(slug)
          : await getCoursePreview(slug);

        if (!cancelled) {
          setCourse(data);

          const requestedTopic = searchParams.get("topic");
          const requestedSubtopic = searchParams.get("subtopic");
          const requestedLanguage = searchParams.get("language");
          const initialLanguage = data.type === "multi-language"
            ? data.languages.find((item) => item.name.toLowerCase() === requestedLanguage?.toLowerCase()) ?? data.languages[0]
            : undefined;
          setSelectedLanguageId(initialLanguage?.id);

          const initialTopics = data.type === "multi-language"
            ? initialLanguage?.topics ?? []
            : data.type === "single-language"
              ? data.topics
              : [];
          // Logged-in users should land directly on the first lesson when
          // they open a course without a topic in the URL. Guests keep the
          // Ready to Start Learning panel.
          const initialTopic = initialTopics.find((item) => item.slug === requestedTopic)
            ?? (authenticated ? initialTopics[0] : undefined);
          setSelectedTopicSlug(initialTopic?.slug ?? null);
          setSelectedSubtopicSlug(
            initialTopic?.subtopics?.some((item) => item.slug === requestedSubtopic)
              ? requestedSubtopic
              : null
          );
        }
      } catch (requestError) {
        console.error("Failed to load course:", requestError);
        if (!cancelled) {
          setCourse(undefined);
          setError("Failed to load course.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [slug, searchParams, user, authLoading, authenticated]);

  const languages = useMemo<CourseLanguage[]>(
    () => (course?.type === "multi-language" ? course.languages : []),
    [course]
  );

  const activeLanguage = useMemo(
    () => languages.find((item) => item.id === selectedLanguageId) ?? languages[0],
    [languages, selectedLanguageId]
  );

  const topics = useMemo<Topic[]>(
    () =>
      course?.type === "multi-language"
        ? activeLanguage?.topics ?? []
        : course?.type === "single-language"
          ? course.topics
          : [],
    [course, activeLanguage]
  );

  const activeTopic = topics.find((topic) => topic.slug === selectedTopicSlug);
  const activeSubtopic = activeTopic?.subtopics?.find((subtopic) => subtopic.slug === selectedSubtopicSlug);
  const activeContent: ContentSource | null = activeSubtopic ?? activeTopic ?? null;

  const navigableContent = useMemo<ContentSource[]>(
    () => topics.flatMap((topic) => [topic, ...(topic.subtopics ?? [])]),
    [topics]
  );

  const activeIndex = activeContent ? navigableContent.findIndex((item) => item._id === activeContent._id) : -1;
  const previousContent = activeIndex > 0 ? navigableContent[activeIndex - 1] : undefined;
  const nextContent = activeIndex >= 0 && activeIndex < navigableContent.length - 1 ? navigableContent[activeIndex + 1] : undefined;

  const getText = (value: LocalizedText): string => {
    if (typeof value === "string") return value;
    const localized = value[language];
    if (typeof localized === "string") return localized;
    return localized.map((part) => typeof part === "string" ? part : part.text).join("");
  };

  const getRichText = (value: LocalizedText): RichTextContent => typeof value === "string" ? value : value[language];

  const renderRichText = (value: RichTextContent): ReactNode => {
    if (typeof value === "string") return value;
    return value.map((part, index) => {
      if (typeof part === "string") return part;
      if (part.type === "bold") return <strong key={index}>{part.text}</strong>;
      if (part.type === "inline-code") return <code key={index} className="inline-code">{part.text}</code>;
      return <span key={index} className="text-highlight">{part.text}</span>;
    });
  };

  const selectTopic = (topic: Topic) => {
    setSelectedTopicSlug(topic.slug);
    setSelectedSubtopicSlug(null);
  };

  const selectSubtopic = (topic: Topic, subtopic: Subtopic) => {
    setSelectedTopicSlug(topic.slug);
    setSelectedSubtopicSlug(subtopic.slug);
  };

  const selectContent = (content: ContentSource) => {
    const topic = topics.find((item) => item._id === content._id);
    if (topic) return selectTopic(topic);
    const parent = topics.find((item) => item.subtopics?.some((subtopic) => subtopic._id === content._id));
    const subtopic = parent?.subtopics?.find((item) => item._id === content._id);
    if (parent && subtopic) selectSubtopic(parent, subtopic);
  };

  const selectLanguage = (nextLanguage: CourseLanguage) => {
    const topic = nextLanguage.topics.find((item) => item.slug === selectedTopicSlug);
    setSelectedLanguageId(nextLanguage.id);
    if (!topic) {
      setSelectedTopicSlug(null);
      setSelectedSubtopicSlug(null);
      return;
    }
    setSelectedTopicSlug(topic.slug);
    setSelectedSubtopicSlug(topic.subtopics?.some((item) => item.slug === selectedSubtopicSlug) ? selectedSubtopicSlug : null);
  };

  const handleLogin = () => {
    navigate("/login", {
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  if (loading) return <CourseDetailsSkeleton />;

  if (error || !course) {
    return (
      <div className="course-not-found">
        <ErrorState message={error || text.notFound[language]} onRetry={loadCourse} />
      </div>
    );
  }

  const breadcrumb = activeSubtopic
    ? `${course.title} / ${getText(activeTopic!.title)} / ${getText(activeSubtopic.title)}`
    : activeTopic
      ? `${course.title} / ${getText(activeTopic.title)}`
      : course.title;

  return (
    <div className="course-details">
      <div className="course-back-bar">
        <button
          type="button"
          className="course-back-button"
          onClick={() => navigate("/courses")}
        >
          <span aria-hidden="true">←</span>
          {language === "bn" ? "কোর্সে ফিরে যান" : "Back to Courses"}
        </button>
      </div>

      <CourseLanguageSelector languages={languages} selectedLanguageId={activeLanguage?.id} onSelect={selectLanguage} />

      <section className="course-learning">
        <CourseSidebar
          topics={topics}
          language={language}
          selectedTopicSlug={selectedTopicSlug}
          selectedSubtopicSlug={selectedSubtopicSlug}
          getText={getText}
          onSelectTopic={selectTopic}
          onSelectSubtopic={selectSubtopic}
        />

        <main className="course-main">
          <div className="course-main-header">
            <p className="course-breadcrumb" aria-label="Course breadcrumb">{breadcrumb}</p>
            {activeContent && <h1 className="course-topic-title">{getText(activeContent.title)}</h1>}
          </div>

          {authenticated && activeContent ? (
            <>
              <CourseContentRenderer
                content={activeContent}
                language={language}
                activeLanguage={activeLanguage}
                getText={getText}
                getRichText={getRichText}
                renderRichText={renderRichText}
              />
              <CourseTopicNavigation
                previousContent={previousContent}
                nextContent={nextContent}
                language={language}
                onSelect={selectContent}
              />
            </>
          ) : (
            <div className="course-start-content">
              <span className="course-start-icon" aria-hidden="true">🔐</span>
              <p className="section-label">{course.title.toUpperCase()}</p>
              <h2>{text.ready[language]}</h2>
              <p>{text.select[language]}</p>
              <button type="button" onClick={handleLogin}>{text.login[language]}</button>
            </div>
          )}
        </main>
      </section>
    </div>
  );
}

export default CourseDetails;
