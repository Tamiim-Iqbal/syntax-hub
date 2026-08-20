import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CodeBlock from "../components/CodeBlock";
import {
  courses,
  type CourseLanguage,
  type Topic,
  type Subtopic,
} from "../mock/Courses";
import "./CourseDetails.css";

function CourseDetails() {
  const { slug } = useParams<{ slug: string }>();

  const course = courses.find(
    (item) => item.slug === slug
  );

  const languages: CourseLanguage[] =
    course &&
    "languages" in course &&
    course.languages
      ? course.languages
      : [];

  const isMultiLanguage = languages.length > 0;

  const [selectedLanguageId, setSelectedLanguageId] =
    useState<string | undefined>(
      languages[0]?.id
    );

  const [selectedTopicSlug, setSelectedTopicSlug] =
    useState<string | null>(null);

  const [selectedSubtopicSlug, setSelectedSubtopicSlug] =
    useState<string | null>(null);

  useEffect(() => {
    if (!course) return;

    if (
      "languages" in course &&
      course.languages
    ) {
      setSelectedLanguageId((current) => {
        if (
          current &&
          course.languages.some(
            (language) => language.id === current
          )
        ) {
          return current;
        }

        return course.languages[0]?.id;
      });
    } else {
      setSelectedLanguageId(undefined);
    }

    setSelectedTopicSlug(null);
    setSelectedSubtopicSlug(null);
  }, [course]);

  const activeLanguage = useMemo(
    () =>
      languages.find(
        (language) =>
          language.id === selectedLanguageId
      ),
    [languages, selectedLanguageId]
  );

  const topics: Topic[] =
    course &&
    "languages" in course &&
    course.languages
      ? activeLanguage?.topics ?? []
      : course?.topics ?? [];

  const activeTopic = topics.find(
    (topic) =>
      topic.slug === selectedTopicSlug
  );

  const activeSubtopic: Subtopic | undefined =
    activeTopic?.subtopics?.find(
      (subtopic) =>
        subtopic.slug === selectedSubtopicSlug
    );

  const activeContent =
    activeSubtopic ?? activeTopic ?? null;

  const selectTopic = (topic: Topic) => {
    setSelectedTopicSlug(topic.slug);
    setSelectedSubtopicSlug(null);
  };

  const selectSubtopic = (
    topic: Topic,
    subtopic: Subtopic
  ) => {
    setSelectedTopicSlug(topic.slug);
    setSelectedSubtopicSlug(subtopic.slug);
  };

  const selectLanguage = (
    language: CourseLanguage
  ) => {
    const currentTopicSlug =
      selectedTopicSlug;

    const currentSubtopicSlug =
      selectedSubtopicSlug;

    const nextTopic =
      language.topics.find(
        (topic) =>
          topic.slug === currentTopicSlug
      );

    setSelectedLanguageId(language.id);

    if (!nextTopic) {
      setSelectedTopicSlug(null);
      setSelectedSubtopicSlug(null);
      return;
    }

    setSelectedTopicSlug(nextTopic.slug);

    const matchingSubtopic =
      nextTopic.subtopics?.find(
        (subtopic) =>
          subtopic.slug ===
          currentSubtopicSlug
      );

    setSelectedSubtopicSlug(
      matchingSubtopic?.slug ?? null
    );
  };

  if (!course) {
    return (
      <div className="course-not-found">
        <h1>Course not found.</h1>
        <p>
          The course you are looking for does not exist.
        </p>
      </div>
    );
  }

  const breadcrumb = activeSubtopic
    ? `${course.title} / ${activeTopic?.title} / ${activeSubtopic.title}`
    : activeTopic
      ? `${course.title} / ${activeTopic.title}`
      : course.title;

  return (
    <div className="course-details">

      {/* Language Selector - OUTSIDE both sections */}
      {isMultiLanguage && (
        <div className="course-language-bar">
          <div className="language-selector">
            {languages.map((language) => (
              <button
                type="button"
                key={language.id}
                className={`language-button ${
                  selectedLanguageId === language.id
                    ? "active"
                    : ""
                }`}
                style={
                  {
                    "--language-color":
                      language.color,
                  } as React.CSSProperties
                }
                onClick={() =>
                  selectLanguage(language)
                }
              >
                {language.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Learning Area */}
      <section className="course-learning">

        {/* LEFT SIDEBAR */}
        <aside className="course-sidebar">

          <div className="course-sidebar-header">
            <p className="section-label">
              COURSE CONTENT
            </p>

            <h2>Topics</h2>
          </div>

          <div className="topic-list">

            {topics.map((topic) => {
              const isSelected =
                selectedTopicSlug === topic.slug;

              return (
                <div
                  className="topic-group"
                  key={topic._id}
                >

                  <button
                    type="button"
                    className={`topic-preview ${
                      isSelected
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      selectTopic(topic)
                    }
                  >

                    <span>
                      {String(topic.order).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <p>{topic.title}</p>

                    {topic.subtopics?.length ? (
                      <span className="topic-chevron">
                        {isSelected ? "⌃" : "⌄"}
                      </span>
                    ) : null}

                  </button>

                  {isSelected &&
                    topic.subtopics?.length ? (
                    <div className="subtopic-list">

                      {topic.subtopics.map(
                        (subtopic) => (
                          <button
                            type="button"
                            key={subtopic._id}
                            className={`subtopic-preview ${
                              selectedSubtopicSlug ===
                              subtopic.slug
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              selectSubtopic(
                                topic,
                                subtopic
                              )
                            }
                          >
                            <span>
                              {String(
                                subtopic.order
                              ).padStart(2, "0")}
                            </span>

                            <p>
                              {subtopic.title}
                            </p>
                          </button>
                        )
                      )}

                    </div>
                  ) : null}

                </div>
              );
            })}

          </div>

        </aside>

        {/* RIGHT CONTENT */}
        <main className="course-main">

          <div className="course-main-header">

            <p className="course-breadcrumb">
              {breadcrumb}
            </p>

            {activeContent && (
              <h1 className="course-topic-title">
                {activeContent.title}
              </h1>
            )}

          </div>

          {activeContent ? (
            <article className="topic-content">

              {/* Explanation */}
              <section className="topic-explanation">

                <p className="section-label">
                  EXPLANATION
                </p>

                <p className="topic-description">
                  {activeContent.content}
                </p>

              </section>

              {/* Code */}
              <section className="topic-code-section">

                <p className="section-label">
                  CODE EXAMPLE
                </p>

                <CodeBlock
                  code={activeContent.code}
                  language={activeContent.language}
                  languageColor={
                    activeLanguage?.color
                  }
                />

              </section>

            </article>
          ) : (
            <div className="course-start-content">

              <span className="course-start-icon">
                🔐
              </span>

              <p className="section-label">
                {course.title.toUpperCase()}
              </p>

              <h2>
                Ready to start learning?
              </h2>

              <p>
                Select a topic from the sidebar
                to start learning.
              </p>

              <button type="button">
                Login to Start Learning
              </button>

            </div>
          )}

        </main>

      </section>
    </div>
  );
}

export default CourseDetails;