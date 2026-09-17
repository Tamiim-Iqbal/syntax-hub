import { useState } from "react";
import EmptyState from "../EmptyState";
import type { LocalizedText, Subtopic, Topic } from "../../types/course";

type Props = {
  topics: Topic[];
  language: "bn" | "en";
  selectedTopicSlug: string | null;
  selectedSubtopicSlug: string | null;
  getText: (text: LocalizedText) => string;
  onSelectTopic: (topic: Topic) => void;
  onSelectSubtopic: (topic: Topic, subtopic: Subtopic) => void;
};

function CourseSidebar({
  topics,
  language,
  selectedTopicSlug,
  selectedSubtopicSlug,
  getText,
  onSelectTopic,
  onSelectSubtopic,
}: Props) {
  const [expandedTopicSlugs, setExpandedTopicSlugs] = useState<Set<string>>(
    new Set()
  );

  return (
    <aside className="course-sidebar" aria-label="Course topics">
      <div className="course-sidebar-header">
        <p className="levels">
          {language === "bn" ? "COURSE CONTENT" : "COURSE CONTENT"}
        </p>

        <h2>{language === "bn" ? "Topics" : "Topics"}</h2>
      </div>

      <div className="topic-list">
        {topics.length === 0 ? (
          <EmptyState
            title="No topics available"
            message="There are no topics available for this course yet."
          />
        ) : (
          topics.map((topic) => {
            /*
             * Topic selected হবে শুধুমাত্র তখন,
             * যখন topic selected এবং কোনো subtopic selected নেই।
             *
             * তাই subtopic click করলে parent topic আর selected থাকবে না।
             */
            const selected =
              selectedTopicSlug === topic.slug && !selectedSubtopicSlug;

            const hasSubtopics = Boolean(topic.subtopics?.length);

            /*
             * Topic active কিনা আলাদাভাবে রাখছি।
             *
             * কারণ subtopic selected থাকলেও parent topic-এর
             * subtopic list expanded থাকতে হবে।
             */
            const topicIsActive = selectedTopicSlug === topic.slug;

            const showSubtopics =
              hasSubtopics &&
              (topicIsActive || expandedTopicSlugs.has(topic.slug));

            const moduleName = topic.module
              ? getText(topic.module).trim()
              : "";

            return (
              <div className="topic-group" key={topic._id}>
                {/* =========================
                    MODULE
                ========================= */}
                {moduleName ? (
                  <div className="topic-module" aria-hidden="true">
                    {moduleName}
                  </div>
                ) : null}

                {/* =========================
                    TOPIC
                ========================= */}
                <div
                  className={`topic-preview ${selected ? "selected" : ""
                    }`}
                >
                  {/* Topic name click */}
                  <button
                    type="button"
                    className="topic-preview-main"
                    onClick={() => {
                      onSelectTopic(topic);

                      /*
                       * Topic click করলে তার subtopics
                       * automatically expand হবে।
                       */
                      if (hasSubtopics) {
                        setExpandedTopicSlugs((current) => {
                          const next = new Set(current);
                          next.add(topic.slug);
                          return next;
                        });
                      }
                    }}
                  >
                    <span>{String(topic.order)}</span>

                    <p>{getText(topic.title)}</p>
                  </button>

                  {/* =========================
                      ARROW
                  ========================= */}
                  {hasSubtopics ? (
                    <button
                      type="button"
                      className="topic-chevron"
                      onClick={(event) => {
                        event.stopPropagation();

                        setExpandedTopicSlugs((current) => {
                          const next = new Set(current);

                          if (next.has(topic.slug)) {
                            next.delete(topic.slug);
                          } else {
                            next.add(topic.slug);
                          }

                          return next;
                        });
                      }}
                      aria-label={
                        showSubtopics
                          ? "Collapse subtopics"
                          : "Expand subtopics"
                      }
                      aria-expanded={showSubtopics}
                    >
                      {showSubtopics ? "⌃" : "⌄"}
                    </button>
                  ) : null}
                </div>

                {/* =========================
                    SUBTOPICS
                ========================= */}
                {showSubtopics ? (
                  <div className="subtopic-list">
                    {(topic.subtopics ?? []).map((subtopic) => {
                      const subtopicSelected =
                        selectedSubtopicSlug === subtopic.slug;

                      return (
                        <button
                          type="button"
                          key={subtopic._id}
                          className={`subtopic-preview ${subtopicSelected ? "selected" : ""
                            }`}
                          onClick={() => {
                            /*
                             * শুধু subtopic select হবে।
                             *
                             * Parent topic selected হবে না,
                             * কিন্তু subtopic list expanded থাকবে।
                             */
                            onSelectSubtopic(topic, subtopic);

                            /*
                             * Safety:
                             * যদি কোনো কারণে এই topic expanded না থাকে,
                             * subtopic click করার পরও expanded রাখবে।
                             */
                            setExpandedTopicSlugs((current) => {
                              const next = new Set(current);
                              next.add(topic.slug);
                              return next;
                            });
                          }}
                          aria-current={
                            subtopicSelected ? "page" : undefined
                          }
                        >
                          <span>{String(subtopic.order)}</span>

                          <p>{getText(subtopic.title)}</p>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

export default CourseSidebar;