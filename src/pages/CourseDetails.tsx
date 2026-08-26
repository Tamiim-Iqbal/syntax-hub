import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useParams } from "react-router-dom";

import CodeBlock from "../components/CodeBlock";
import CourseDetailsSkeleton from "../components/CourseDetailsSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

import {
  type CourseLanguage,
  type Topic,
  type Subtopic,
  type ContentSection,
  type LocalizedText,
  type RichTextContent,
} from "../types/course";

import { getCourseBySlug } from "../services/courseService";
import { useLanguage } from "../context/LanguageContext";

import "./CourseDetails.css";

type ContentSource = Topic | Subtopic;

/* ============================= */
/* Content Helpers               */
/* ============================= */

const getContentSections = (
  content: ContentSource
): ContentSection[] => {
  if (
    content.sections &&
    content.sections.length > 0
  ) {
    return content.sections;
  }

  const sections: ContentSection[] = [];

  if (content.content !== undefined) {
    sections.push({
      type: "explanation",
      content: content.content,
    });
  }

  if (content.code !== undefined) {
    sections.push({
      type: "code",
      code: content.code,
      language: content.language,
    });
  }

  return sections;
};

/* ============================= */
/* Course Details Text           */
/* ============================= */

const courseDetailsText = {
  courseContent: {
    bn: "কোর্স কনটেন্ট",
    en: "Course Content",
  },

  topics: {
    bn: "টপিক",
    en: "Topics",
  },

  explanation: {
    bn: "ব্যাখ্যা",
    en: "Explanation",
  },

  codeExample: {
    bn: "কোড উদাহরণ",
    en: "Code Example",
  },

  readyToStart: {
    bn: "শেখা শুরু করতে প্রস্তুত?",
    en: "Ready to start learning?",
  },

  selectTopic: {
    bn: "শেখা শুরু করতে sidebar থেকে একটি topic নির্বাচন করুন।",
    en: "Select a topic from the sidebar to start learning.",
  },

  loginToStart: {
    bn: "লগইন করে শেখা শুরু করুন",
    en: "Login to Start Learning",
  },

  courseNotFound: {
    bn: "কোর্স পাওয়া যায়নি।",
    en: "Course not found.",
  },

  courseNotFoundDescription: {
    bn: "আপনি যে কোর্সটি খুঁজছেন সেটি পাওয়া যায়নি।",
    en: "The course you are looking for does not exist.",
  },

  previous: {
    bn: "আগের টপিক",
    en: "Previous Topic",
  },

  next: {
    bn: "পরের টপিক",
    en: "Next Topic",
  },
};

/* ============================= */
/* Component                    */
/* ============================= */

function CourseDetails() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const { language } = useLanguage();

  const [course, setCourse] =
    useState<
      ReturnType<typeof getCourseBySlug> extends Promise<
        infer T
      >
      ? T
      : never
    >();

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ============================= */
  /* Load Course                   */
  /* ============================= */

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

      const data =
        await getCourseBySlug(slug);

      setCourse(data);
    } catch (error) {
      console.error(
        "Failed to load course:",
        error
      );

      setCourse(undefined);

      setError(
        "Failed to load course."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================= */
  /* Initial Load                  */
  /* ============================= */

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
        const data =
          await getCourseBySlug(slug);

        if (!cancelled) {
          setCourse(data);
          setError("");
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Failed to load course:",
          error
        );

        if (!cancelled) {
          setCourse(undefined);
          setError(
            "Failed to load course."
          );
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  /* ============================= */
  /* Text Helpers                  */
  /* ============================= */

  const getText = (
    text: LocalizedText
  ): string => {
    const localized =
      typeof text === "string"
        ? text
        : text[language];

    if (typeof localized === "string") {
      return localized;
    }

    return localized
      .map((part) =>
        typeof part === "string"
          ? part
          : part.text
      )
      .join("");
  };

  const getRichText = (
    text: LocalizedText
  ): RichTextContent => {
    if (typeof text === "string") {
      return text;
    }

    return text[language];
  };

  const renderRichText = (
    text: RichTextContent
  ): ReactNode => {
    if (typeof text === "string") {
      return text;
    }

    return text.map((part, index) => {
      if (typeof part === "string") {
        return part;
      }

      if (part.type === "bold") {
        return (
          <strong key={`bold-${index}`}>
            {part.text}
          </strong>
        );
      }

      if (part.type === "inline-code") {
        return (
          <code
            key={`inline-code-${index}`}
            className="inline-code"
          >
            {part.text}
          </code>
        );
      }

      return (
        <span
          key={`highlight-${index}`}
          className="text-highlight"
        >
          {part.text}
        </span>
      );
    });
  };

  /* ============================= */
  /* Languages                     */
  /* ============================= */

  const languages =
    useMemo<CourseLanguage[]>(
      () =>
        course &&
          "languages" in course &&
          course.languages
          ? course.languages
          : [],
      [course]
    );

  const isMultiLanguage =
    languages.length > 0;

  const [
    selectedLanguageId,
    setSelectedLanguageId,
  ] = useState<string | undefined>(
    languages[0]?.id
  );

  const effectiveSelectedLanguageId =
    languages.some(
      (courseLanguage) =>
        courseLanguage.id ===
        selectedLanguageId
    )
      ? selectedLanguageId
      : languages[0]?.id;

  const activeLanguage =
    useMemo(
      () =>
        languages.find(
          (courseLanguage) =>
            courseLanguage.id ===
            effectiveSelectedLanguageId
        ),
      [
        languages,
        effectiveSelectedLanguageId,
      ]
    );

  /* ============================= */
  /* Topics                        */
  /* ============================= */

  const topics: Topic[] =
    course &&
      "languages" in course &&
      course.languages
      ? activeLanguage?.topics ?? []
      : course?.topics ?? [];

  const [
    selectedTopicSlug,
    setSelectedTopicSlug,
  ] = useState<string | null>(null);

  const [
    selectedSubtopicSlug,
    setSelectedSubtopicSlug,
  ] = useState<string | null>(null);

  const activeTopic = topics.find(
    (topic) =>
      topic.slug ===
      selectedTopicSlug
  );

  const activeSubtopic:
    | Subtopic
    | undefined =
    activeTopic?.subtopics?.find(
      (subtopic) =>
        subtopic.slug ===
        selectedSubtopicSlug
    );

  const activeContent =
    activeSubtopic ??
    activeTopic ??
    null;

  /* ============================= */
  /* Previous / Next               */
  /* ============================= */

  const navigableContent:
    ContentSource[] =
    topics.flatMap((topic) => [
      topic,
      ...(topic.subtopics ?? []),
    ]);

  const activeContentIndex =
    activeContent
      ? navigableContent.findIndex(
        (content) =>
          content._id ===
          activeContent._id
      )
      : -1;

  const previousContent =
    activeContentIndex > 0
      ? navigableContent[
      activeContentIndex - 1
      ]
      : undefined;

  const nextContent =
    activeContentIndex >= 0 &&
      activeContentIndex <
      navigableContent.length - 1
      ? navigableContent[
      activeContentIndex + 1
      ]
      : undefined;

  /* ============================= */
  /* Topic Selection               */
  /* ============================= */

  const selectTopic = (
    topic: Topic
  ) => {
    setSelectedTopicSlug(
      topic.slug
    );

    setSelectedSubtopicSlug(
      null
    );
  };

  const selectSubtopic = (
    topic: Topic,
    subtopic: Subtopic
  ) => {
    setSelectedTopicSlug(
      topic.slug
    );

    setSelectedSubtopicSlug(
      subtopic.slug
    );
  };

  const selectContent = (
    content: ContentSource
  ) => {
    /* Main topic */

    const topic = topics.find(
      (item) =>
        item._id === content._id
    );

    if (topic) {
      selectTopic(topic);
      return;
    }

    /* Subtopic */

    const parentTopic =
      topics.find((item) =>
        item.subtopics?.some(
          (subtopic) =>
            subtopic._id ===
            content._id
        )
      );

    const subtopic =
      parentTopic?.subtopics?.find(
        (item) =>
          item._id === content._id
      );

    if (
      parentTopic &&
      subtopic
    ) {
      selectSubtopic(
        parentTopic,
        subtopic
      );
    }
  };

  /* ============================= */
  /* Language Selection            */
  /* ============================= */

  const selectLanguage = (
    courseLanguage: CourseLanguage
  ) => {
    const currentTopicSlug =
      selectedTopicSlug;

    const currentSubtopicSlug =
      selectedSubtopicSlug;

    const nextTopic =
      courseLanguage.topics.find(
        (topic) =>
          topic.slug ===
          currentTopicSlug
      );

    setSelectedLanguageId(
      courseLanguage.id
    );

    /* Current topic doesn't exist
       in the new language. */

    if (!nextTopic) {
      setSelectedTopicSlug(null);
      setSelectedSubtopicSlug(null);
      return;
    }

    /* Keep the same topic */

    setSelectedTopicSlug(
      nextTopic.slug
    );

    /* Try to keep the same subtopic */

    const matchingSubtopic =
      nextTopic.subtopics?.find(
        (subtopic) =>
          subtopic.slug ===
          currentSubtopicSlug
      );

    setSelectedSubtopicSlug(
      matchingSubtopic?.slug ??
      null
    );
  };

  /* ============================= */
  /* Loading                       */
  /* ============================= */

  if (loading) {
    return <CourseDetailsSkeleton />;
  }

  /* ============================= */
  /* Error                         */
  /* ============================= */

  if (error || !course) {
    return (
      <div className="course-not-found">
        <ErrorState
          message={
            error ||
            courseDetailsText
              .courseNotFoundDescription[
            language
            ]
          }
          onRetry={loadCourse}
        />
      </div>
    );
  }

  /* ============================= */
  /* Breadcrumb                    */
  /* ============================= */

  const breadcrumb =
    activeSubtopic
      ? `${course.title} / ${getText(
        activeTopic!.title
      )} / ${getText(
        activeSubtopic.title
      )}`
      : activeTopic
        ? `${course.title} / ${getText(
          activeTopic.title
        )}`
        : course.title;

  /* ============================= */
  /* Render                        */
  /* ============================= */

  return (
    <div className="course-details">

      {/* ============================= */}
      {/* Language Selector             */}
      {/* ============================= */}

      {isMultiLanguage && (
        <div className="course-language-bar">
          <div className="language-selector">

            {languages.map(
              (courseLanguage) => (
                <button
                  type="button"
                  key={
                    courseLanguage.id
                  }
                  className={`language-button ${effectiveSelectedLanguageId ===
                      courseLanguage.id
                      ? "active"
                      : ""
                    }`}
                  style={
                    {
                      "--language-color":
                        courseLanguage.color,
                    } as React.CSSProperties
                  }
                  onClick={() =>
                    selectLanguage(
                      courseLanguage
                    )
                  }
                >
                  {courseLanguage.name}
                </button>
              )
            )}

          </div>
        </div>
      )}

      {/* ============================= */}
      {/* Main Learning Area            */}
      {/* ============================= */}

      <section className="course-learning">

        {/* ============================= */}
        {/* LEFT SIDEBAR                  */}
        {/* ============================= */}

        <aside className="course-sidebar">

          <div className="course-sidebar-header">

            <p className="section-label">
              {
                courseDetailsText
                  .courseContent[
                language
                ]
              }
            </p>

            <h2>
              {
                courseDetailsText
                  .topics[
                language
                ]
              }
            </h2>

          </div>

          <div className="topic-list">
            {topics.length === 0 ? (
              <EmptyState
                title="No topics available"
                message="There are no topics available for this course yet."
              />
            ) : (
              topics.map((topic) => {
                const isSelected =
                  selectedTopicSlug ===
                  topic.slug;

                return (
                  <div
                    className="topic-group"
                    key={topic._id}
                  >

                    {/* Main Topic */}

                    <button
                      type="button"
                      className={`topic-preview ${isSelected
                          ? "selected"
                          : ""
                        }`}
                      onClick={() =>
                        selectTopic(topic)
                      }
                    >

                      <span>
                        {String(
                          topic.order
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <p>
                        {getText(
                          topic.title
                        )}
                      </p>

                      {topic.subtopics
                        ?.length ? (
                        <span className="topic-chevron">
                          {isSelected
                            ? "⌃"
                            : "⌄"}
                        </span>
                      ) : null}

                    </button>

                    {/* Subtopics */}

                    {isSelected &&
                      topic.subtopics
                        ?.length ? (
                      <div className="subtopic-list">

                        {topic.subtopics.map(
                          (subtopic) => (
                            <button
                              type="button"
                              key={
                                subtopic._id
                              }
                              className={`subtopic-preview ${selectedSubtopicSlug ===
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
                                ).padStart(
                                  2,
                                  "0"
                                )}
                              </span>

                              <p>
                                {getText(
                                  subtopic.title
                                )}
                              </p>

                            </button>
                          )
                        )}

                      </div>
                    ) : null}

                  </div>
                );
              })
              )}

          </div>

        </aside>

        {/* ============================= */}
        {/* RIGHT CONTENT                 */}
        {/* ============================= */}

        <main className="course-main">

          <div className="course-main-header">

            <p className="course-breadcrumb">
              {breadcrumb}
            </p>

            {activeContent && (
              <h1 className="course-topic-title">
                {getText(
                  activeContent.title
                )}
              </h1>
            )}

          </div>

          {/* ============================= */}
          {/* Active Topic Content           */}
          {/* ============================= */}

          {activeContent ? (
            <article className="topic-content">

              {getContentSections(
                activeContent
              ).map(
                (section, index) => {

                  if (
                    section.type ===
                    "explanation"
                  ) {
                    return (
                      <section
                        className="topic-explanation"
                        key={`explanation-${index}`}
                      >
                        <p className="topic-description">
                          {renderRichText(
                            getRichText(
                              section.content
                            )
                          )}
                        </p>
                      </section>
                    );
                  }

                  if (
                    section.type ===
                    "only-text"
                  ) {
                    return (
                      <section
                        className="topic-only-text"
                        key={`only-text-${index}`}
                      >
                        <p className="topic-description">
                          {renderRichText(
                            getRichText(
                              section.content
                            )
                          )}
                        </p>
                      </section>
                    );
                  }

                  if (
                    section.type ===
                    "bullet-points"
                  ) {
                    return (
                      <section
                        className="topic-bullet-points"
                        key={`bullet-points-${index}`}
                      >
                        <ul>
                          {section.items.map(
                            (
                              item,
                              itemIndex
                            ) => (
                              <li
                                key={`bullet-${index}-${itemIndex}`}
                              >
                                {renderRichText(
                                  getRichText(
                                    item
                                  )
                                )}
                              </li>
                            )
                          )}
                        </ul>
                      </section>
                    );
                  }

                  if (
                    section.type ===
                    "image"
                  ) {
                    return (
                      <figure
                        className="topic-image"
                        key={`image-${index}`}
                      >
                        <img
                          src={section.src}
                          alt={section.alt}
                        />

                        {section.caption && (
                          <figcaption>
                            {getText(
                              section.caption
                            )}
                          </figcaption>
                        )}
                      </figure>
                    );
                  }

                  return (
                    <section
                      className="topic-code-section"
                      key={`code-${index}`}
                    >
                      <p className="section-label">
                        {
                          courseDetailsText
                            .codeExample[
                          language
                          ]
                        }
                      </p>

                      <CodeBlock
                        code={
                          section.code
                        }
                        language={
                          section.language
                        }
                        languageColor={
                          activeLanguage?.color
                        }
                      />
                    </section>
                  );
                }
              )}

              {/* ============================= */}
              {/* Previous / Next                */}
              {/* ============================= */}

              <nav
                className="topic-navigation"
                aria-label="Topic navigation"
              >

                <button
                  type="button"
                  className="topic-navigation-button previous"
                  onClick={() => {
                    if (
                      previousContent
                    ) {
                      selectContent(
                        previousContent
                      );
                    }
                  }}
                  disabled={
                    !previousContent
                  }
                >
                  <span className="topic-navigation-arrow">
                    ←
                  </span>

                  <span>
                    {
                      courseDetailsText
                        .previous[
                      language
                      ]
                    }
                  </span>
                </button>

                <button
                  type="button"
                  className="topic-navigation-button next"
                  onClick={() => {
                    if (
                      nextContent
                    ) {
                      selectContent(
                        nextContent
                      );
                    }
                  }}
                  disabled={
                    !nextContent
                  }
                >
                  <span>
                    {
                      courseDetailsText
                        .next[
                      language
                      ]
                    }
                  </span>

                  <span className="topic-navigation-arrow">
                    →
                  </span>
                </button>

              </nav>

            </article>
          ) : (

            /* ============================= */
            /* Course Start Screen            */
            /* ============================= */

            <div className="course-start-content">

              <span className="course-start-icon">
                🔐
              </span>

              <p className="section-label">
                {course.title.toUpperCase()}
              </p>

              <h2>
                {
                  courseDetailsText
                    .readyToStart[
                  language
                  ]
                }
              </h2>

              <p>
                {
                  courseDetailsText
                    .selectTopic[
                  language
                  ]
                }
              </p>

              <button type="button">
                {
                  courseDetailsText
                    .loginToStart[
                  language
                  ]
                }
              </button>

            </div>
          )}

        </main>

      </section>
    </div>
  );
}

export default CourseDetails;