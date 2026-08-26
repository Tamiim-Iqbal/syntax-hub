import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";

import CourseDetailsSkeleton from "../components/CourseDetailsSkeleton";
import ErrorState from "../components/ErrorState";
import CourseLanguageSelector from "../components/course-details/CourseLanguageSelector";
import CourseSidebar from "../components/course-details/CourseSidebar";
import CourseContentRenderer from "../components/course-details/CourseContentRenderer";
import CourseTopicNavigation from "../components/course-details/CourseTopicNavigation";
import type { ContentSource } from "../components/course-details/types";
import type { Course, CourseLanguage, LocalizedText, RichTextContent, Subtopic, Topic } from "../types/course";
import { getCourseBySlug } from "../services/courseService";
import { useLanguage } from "../context/useLanguage";
import "./CourseDetails.css";

const text = {
  ready: { bn: "শেখা শুরু করতে প্রস্তুত?", en: "Ready to start learning?" },
  select: { bn: "শেখা শুরু করতে sidebar থেকে একটি topic নির্বাচন করুন।", en: "Select a topic from the sidebar to start learning." },
  login: { bn: "লগইন করে শেখা শুরু করুন", en: "Login to Start Learning" },
  notFound: { bn: "কোর্স পাওয়া যায়নি।", en: "Course not found." },
};

function CourseDetails() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
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
      const data = await getCourseBySlug(slug);
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
      try {
        const data = await getCourseBySlug(slug);
        if (!cancelled) {
          setCourse(data);
          setError("");
          setLoading(false);
          setSelectedTopicSlug(null);
          setSelectedSubtopicSlug(null);
          setSelectedLanguageId(data.type === "multi-language" ? data.languages[0]?.id : undefined);
        }
      } catch (requestError) {
        console.error("Failed to load course:", requestError);
        if (!cancelled) {
          setCourse(undefined);
          setError("Failed to load course.");
          setLoading(false);
        }
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [slug]);

  const languages = useMemo<CourseLanguage[]>(
    () => (course?.type === "multi-language" ? course.languages : []),
    [course]
  );

  const activeLanguage = useMemo(
    () => languages.find((item) => item.id === selectedLanguageId) ?? languages[0],
    [languages, selectedLanguageId]
  );

  const topics: Topic[] = course?.type === "multi-language"
    ? activeLanguage?.topics ?? []
    : course?.type === "single-language"
      ? course.topics
      : [];

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

          {activeContent ? (
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
              <button type="button">{text.login[language]}</button>
            </div>
          )}
        </main>
      </section>
    </div>
  );
}

export default CourseDetails;
