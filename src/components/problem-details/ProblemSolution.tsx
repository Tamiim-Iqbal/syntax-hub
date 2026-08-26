import CodeBlock from "../CodeBlock";
import EmptyState from "../EmptyState";
import type { Problem } from "../../types/course";

type Props = { problem: Problem; selectedLanguage: string; onSelectLanguage: (language: string) => void };

function ProblemSolution({ problem, selectedLanguage, onSelectLanguage }: Props) {
  const solutions = problem.solutions ?? [];
  const solution = solutions.find((item) => item.language === selectedLanguage) ?? solutions[0];
  if (solutions.length === 0) {
    return <EmptyState title="No solution available" message="A solution has not been added for this problem yet." />;
  }
  return (
    <section className="problem-solution-section" aria-label="Problem solution">
      <div className="problem-solution-languages" role="group" aria-label="Solution language selector">
        {solutions.map((item) => (
          <button
            type="button"
            key={item.language}
            className={solution?.language === item.language ? "active" : ""}
            onClick={() => onSelectLanguage(item.language)}
            aria-pressed={solution?.language === item.language}
          >
            {item.label}
          </button>
        ))}
      </div>
      {solution && <CodeBlock code={solution.code} language={solution.language} />}
    </section>
  );
}

export default ProblemSolution;
