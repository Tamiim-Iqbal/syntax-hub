import type { Problem } from "../../types/course";

type Props = { previousProblem: Problem | null; nextProblem: Problem | null; onNavigate: (problem: Problem) => void };

function ProblemNavigation({ previousProblem, nextProblem, onNavigate }: Props) {
  return (
    <nav className="topic-navigation" aria-label="Problem navigation">
      <button type="button" className="topic-navigation-button previous" disabled={!previousProblem} onClick={() => previousProblem && onNavigate(previousProblem)} aria-label="Previous problem">
        <span className="topic-navigation-arrow" aria-hidden="true">←</span><span>Previous Problem</span>
      </button>
      <button type="button" className="topic-navigation-button next" disabled={!nextProblem} onClick={() => nextProblem && onNavigate(nextProblem)} aria-label="Next problem">
        <span>Next Problem</span><span className="topic-navigation-arrow" aria-hidden="true">→</span>
      </button>
    </nav>
  );
}

export default ProblemNavigation;
