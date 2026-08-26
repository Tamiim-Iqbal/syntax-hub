import type { Problem } from "../../types/course";
import { getDisplayText } from "../../utils/localizedText";

type Props = { problem: Problem };

function ProblemExamples({ problem }: Props) {
  const examples = problem.problem?.examples ?? [];
  const constraints = problem.problem?.constraints ?? [];
  if (examples.length === 0 && constraints.length === 0) return null;

  return (
    <section aria-label="Examples and constraints">
      {examples.map((example, index) => (
        <div className="problem-example" key={`${example.input}-${index}`}>
          <h3>Example {index + 1}</h3>
          <pre>{`Input:\n${example.input}\n\nOutput:\n${example.output}`}</pre>
          {example.explanation && <p>{getDisplayText(example.explanation)}</p>}
        </div>
      ))}
      {constraints.length > 0 && (
        <div>
          <h3>Constraints</h3>
          <ul>{constraints.map((constraint, index) => <li key={index}>{getDisplayText(constraint)}</li>)}</ul>
        </div>
      )}
    </section>
  );
}

export default ProblemExamples;
