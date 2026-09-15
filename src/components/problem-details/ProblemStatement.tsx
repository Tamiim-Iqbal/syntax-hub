import type { Problem } from "../../types/course";
import { RichTextRenderer } from "../RichTextRenderer";

type Props = { problem: Problem };

function ProblemStatement({ problem }: Props) {
  if (!problem.problem) return <p>No problem statement is available yet.</p>;
  return (
    <section aria-labelledby="problem-statement-title">
      <h2 id="problem-statement-title">Problem Statement</h2>
      <p><RichTextRenderer value={problem.problem.description} /></p>
    </section>
  );
}

export default ProblemStatement;
