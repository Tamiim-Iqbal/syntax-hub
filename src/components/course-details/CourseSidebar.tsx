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
  return (
    <aside className="course-sidebar" aria-label="Course topics">
      <div className="course-sidebar-header">
        <p className="section-label">{language === "bn" ? "কোর্স কনটেন্ট" : "Course Content"}</p>
        <h2>{language === "bn" ? "টপিক" : "Topics"}</h2>
      </div>

      <div className="topic-list">
        {topics.length === 0 ? (
          <EmptyState title="No topics available" message="There are no topics available for this course yet." />
        ) : (
          topics.map((topic) => {
            const selected = selectedTopicSlug === topic.slug;
            return (
              <div className="topic-group" key={topic._id}>
                <button
                  type="button"
                  className={`topic-preview ${selected ? "selected" : ""}`}
                  onClick={() => onSelectTopic(topic)}
                  aria-expanded={topic.subtopics?.length ? selected : undefined}
                >
                  <span>{String(topic.order).padStart(2, "0")}</span>
                  <p>{getText(topic.title)}</p>
                  {topic.subtopics?.length ? (
                    <span className="topic-chevron" aria-hidden="true">{selected ? "⌃" : "⌄"}</span>
                  ) : null}
                </button>

                {selected && topic.subtopics?.length ? (
                  <div className="subtopic-list">
                    {topic.subtopics.map((subtopic) => (
                      <button
                        type="button"
                        key={subtopic._id}
                        className={`subtopic-preview ${selectedSubtopicSlug === subtopic.slug ? "selected" : ""}`}
                        onClick={() => onSelectSubtopic(topic, subtopic)}
                        aria-current={selectedSubtopicSlug === subtopic.slug ? "page" : undefined}
                      >
                        <span>{String(subtopic.order).padStart(2, "0")}</span>
                        <p>{getText(subtopic.title)}</p>
                      </button>
                    ))}
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
