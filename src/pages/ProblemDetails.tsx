import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getProblem, getProblemCategory } from "../services/courseService";
import type { Problem, ProblemCategory } from "../types/course";
import { getDisplayText } from "../utils/localizedText";
import ProblemDetailsSkeleton from "../components/ProblemDetailsSkeleton";
import ErrorState from "../components/ErrorState";
import ProblemHeader from "../components/problem-details/ProblemHeader";
import ProblemTabs, { type Tab } from "../components/problem-details/ProblemTabs";
import ProblemStatement from "../components/problem-details/ProblemStatement";
import ProblemExamples from "../components/problem-details/ProblemExamples";
import ProblemApproach from "../components/problem-details/ProblemApproach";
import ProblemSolution from "../components/problem-details/ProblemSolution";
import ProblemNavigation from "../components/problem-details/ProblemNavigation";
import "./ProblemDetails.css";

function ProblemDetails() {
  const { categorySlug, problemSlug } = useParams<{ categorySlug: string; problemSlug: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [category, setCategory] = useState<ProblemCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("problem");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");

  const loadProblem = async () => {
    if (!categorySlug || !problemSlug) {
      setProblem(null);
      setCategory(null);
      setError("Invalid problem.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [problemData, categoryData] = await Promise.all([
        getProblem(categorySlug, problemSlug),
        getProblemCategory(categorySlug),
      ]);
      setProblem(problemData);
      setCategory(categoryData);
      setSelectedLanguage(problemData.solutions?.[0]?.language ?? "javascript");
      setActiveTab("problem");
    } catch (requestError) {
      console.error("Failed to load problem:", requestError);
      setProblem(null);
      setCategory(null);
      setError("Failed to load problem.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!categorySlug || !problemSlug) {
        if (!cancelled) {
          setProblem(null);
          setCategory(null);
          setError("Invalid problem.");
          setLoading(false);
        }
        return;
      }
      try {
        const [problemData, categoryData] = await Promise.all([
          getProblem(categorySlug, problemSlug),
          getProblemCategory(categorySlug),
        ]);
        if (!cancelled) {
          setProblem(problemData);
          setCategory(categoryData);
          setSelectedLanguage(problemData.solutions?.[0]?.language ?? "javascript");
          setActiveTab("problem");
          setError(null);
          setLoading(false);
        }
      } catch (requestError) {
        console.error("Failed to load problem:", requestError);
        if (!cancelled) {
          setProblem(null);
          setCategory(null);
          setError("Failed to load problem.");
          setLoading(false);
        }
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [categorySlug, problemSlug]);

  if (loading) return <ProblemDetailsSkeleton />;

  if (error || !problem) {
    return (
      <div className="problem-details-page">
        <ErrorState message={error ?? "Problem not found."} onRetry={loadProblem} />
      </div>
    );
  }

  const problems = category?.problems ?? [];
  const currentIndex = problems.findIndex((item) => item.slug === problemSlug);
  const previousProblem = currentIndex > 0 ? problems[currentIndex - 1] : null;
  const nextProblem = currentIndex >= 0 && currentIndex < problems.length - 1 ? problems[currentIndex + 1] : null;
  const goToProblem = (target: Problem) => {
    if (categorySlug) navigate(`/courses/problem-solving/${categorySlug}/${target.slug}`);
  };

  return (
    <div className="problem-details-page">
      <Link to={`/courses/problem-solving/${categorySlug}`} className="problem-back-link">
        ← Back to Problems
      </Link>

      <ProblemHeader problem={problem} title={getDisplayText(problem.title)} />
      <ProblemTabs activeTab={activeTab} onChange={setActiveTab} />

      <main className={`problem-details-content ${activeTab === "solution" ? "solution-active" : ""}`}>
        {activeTab === "problem" && (
          <>
            <ProblemStatement problem={problem} />
            <ProblemExamples problem={problem} />
          </>
        )}
        {activeTab === "approach" && <ProblemApproach problem={problem} />}
        {activeTab === "solution" && (
          <ProblemSolution
            problem={problem}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
          />
        )}
      </main>

      <ProblemNavigation previousProblem={previousProblem} nextProblem={nextProblem} onNavigate={goToProblem} />
    </div>
  );
}

export default ProblemDetails;
