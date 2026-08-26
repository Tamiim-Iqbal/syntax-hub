import type { Problem } from "../../types/course";

type Props = { problem: Problem; title: string };

function ProblemHeader({ problem, title }: Props) {
  return (
    <header className="problem-details-header">
      <h1>{title}</h1>
      <div className="problem-meta" aria-label="Problem metadata">
        {problem.difficulty && <span className={`problem-difficulty problem-difficulty-${problem.difficulty}`}>{problem.difficulty}</span>}
        {problem.rating != null && <span className="problem-meta-item">Rating {problem.rating}</span>}
        {problem.judge && (
          problem.judgeUrl ? (
            <a
              href={problem.judgeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="problem-meta-judge"
              aria-label={`Open ${problem.judge} problem${problem.problemNumber ? ` ${problem.problemNumber}` : ""}`}
            >
              {problem.judge}{problem.problemNumber ? ` #${problem.problemNumber}` : ""}
            </a>
          ) : (
            <span className="problem-meta-judge">
              {problem.judge}{problem.problemNumber ? ` #${problem.problemNumber}` : ""}
            </span>
          )
        )}
        {problem.topics.length > 0 && <span className="problem-meta-topic">{problem.topics.join(" · ")}</span>}
      </div>
    </header>
  );
}

export default ProblemHeader;
