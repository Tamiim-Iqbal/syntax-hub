import type { Problem } from "../../types/course";
import { getDisplayText } from "../../utils/localizedText";

type Props = { problem: Problem };

function ProblemApproach({ problem }: Props) {
  if (!problem.approach) return <p>No approach is available yet.</p>;
  return (
    <section aria-labelledby="approach-title">
      <h2 id="approach-title">{getDisplayText(problem.approach.title)}</h2>
      {problem.approach.sections.map((section, index) => {
        if (section.type === "only-text" || section.type === "explanation") {
          return <p key={index}>{getDisplayText(section.content)}</p>;
        }
        if (section.type === "bullet-points") {
          return <ul key={index}>{section.items.map((item, itemIndex) => <li key={itemIndex}>{getDisplayText(item)}</li>)}</ul>;
        }
        return null;
      })}
    </section>
  );
}

export default ProblemApproach;
