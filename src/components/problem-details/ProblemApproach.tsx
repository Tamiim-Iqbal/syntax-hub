import type { Problem } from "../../types/course";
import { RichTextRenderer } from "../RichTextRenderer";

type Props = { problem: Problem };

function ProblemApproach({ problem }: Props) {
  if (!problem.approach) return <p>No approach is available yet.</p>;
  return (
    <section aria-labelledby="approach-title">
      <h2 id="approach-title"><RichTextRenderer value={problem.approach.title} /></h2>
      {problem.approach.sections.map((section, index) => {
        if (section.type === "only-text" || section.type === "explanation") {
          return <p key={index}><RichTextRenderer value={section.content} /></p>;
        }
        if (section.type === "semi-title") {
          return <h3 key={index}><RichTextRenderer value={section.content} /></h3>;
        }
        if (section.type === "red-text") {
          return <p key={index} className="problem-approach-red-text"><RichTextRenderer value={section.content} /></p>;
        }
        if (section.type === "bullet-points") {
          return <ul key={index}>{section.items.map((item, itemIndex) => <li key={itemIndex}><RichTextRenderer value={item} /></li>)}</ul>;
        }
        return null;
      })}
    </section>
  );
}

export default ProblemApproach;
