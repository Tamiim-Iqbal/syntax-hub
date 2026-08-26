import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getProblem,
  getProblemCategory,
} from "../services/courseService";

import type {
  LocalizedText,
  Problem,
  ProblemCategory,
} from "../types/course";

import "./ProblemDetails.css";

import CodeBlock from "../components/CodeBlock";
import ProblemDetailsSkeleton from "../components/ProblemDetailsSkeleton";
import ErrorState from "../components/ErrorState";

const getDisplayText = (
  text: LocalizedText
): string => {
  if (typeof text === "string") {
    return text;
  }

  const value = text.en;

  if (typeof value === "string") {
    return value;
  }

  return value
    .map((part) =>
      typeof part === "string"
        ? part
        : part.text
    )
    .join("");
};

function ProblemDetails() {
  const {
    categorySlug,
    problemSlug,
  } = useParams<{
    categorySlug: string;
    problemSlug: string;
  }>();

  const navigate = useNavigate();

  const [problem, setProblem] =
    useState<Problem | null>(null);

  const [category, setCategory] =
    useState<ProblemCategory | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [activeTab, setActiveTab] =
    useState<
      "problem" | "approach" | "solution"
    >("problem");

  const [selectedLanguage, setSelectedLanguage] =
    useState<string>("javascript");

  /* =========================
     LOAD PROBLEM
  ========================= */

  const loadProblem = async () => {
    if (!categorySlug || !problemSlug) {
      setError("Invalid problem");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [
        problemData,
        categoryData,
      ] = await Promise.all([
        getProblem(
          categorySlug,
          problemSlug
        ),

        getProblemCategory(
          categorySlug
        ),
      ]);

      setProblem(problemData);
      setCategory(categoryData);

      const firstLanguage =
        problemData.solutions?.[0]
          ?.language;

      setSelectedLanguage(
        firstLanguage ?? "javascript"
      );

      setActiveTab("problem");
    } catch (error) {
      console.error(error);

      setError(
        "Failed to load problem."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    const load = async () => {
      await loadProblem();
    };

    load();
  }, [categorySlug, problemSlug]);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return <ProblemDetailsSkeleton />;
  }

  /* =========================
     ERROR
  ========================= */

  if (error || !problem) {
    return (
      <div className="problem-details-page">
        <ErrorState
          message={
            error ??
            "Problem not found."
          }
          onRetry={loadProblem}
        />
      </div>
    );
  }

  const title = getDisplayText(
    problem.title
  );

  const problems =
    category?.problems ?? [];

  const currentIndex =
    problems.findIndex(
      (item) =>
        item.slug === problemSlug
    );

  const previousProblem =
    currentIndex > 0
      ? problems[currentIndex - 1]
      : null;

  const nextProblem =
    currentIndex >= 0 &&
    currentIndex <
      problems.length - 1
      ? problems[currentIndex + 1]
      : null;

  /* =========================
     PREVIOUS / NEXT
  ========================= */

  const goToProblem = (
    targetProblem: Problem
  ) => {
    if (!categorySlug) {
      return;
    }

    navigate(
      `/courses/problem-solving/${categorySlug}/${targetProblem.slug}`
    );
  };

  /* =========================
     SELECTED SOLUTION
  ========================= */

  const solution =
    problem.solutions?.find(
      (item) =>
        item.language ===
        selectedLanguage
    );

  return (
    <div className="problem-details-page">

      {/* Gradient top border */}
      <div className="problem-details-gradient-border" />

      {/* Back */}
      <Link
        to={`/courses/problem-solving/${categorySlug}`}
        className="problem-back-link"
      >
        ← Back to Problems
      </Link>

      {/* Header */}
      <header className="problem-details-header">
        <div>
          <h1>{title}</h1>

          {/* Problem metadata */}
          <div className="problem-meta">

            {/* Difficulty */}
            {problem.difficulty && (
              <span
                className={`problem-difficulty problem-difficulty-${problem.difficulty}`}
              >
                {problem.difficulty}
              </span>
            )}

            {/* Rating */}
            {problem.rating != null && (
              <span className="problem-meta-item">
                Rating {problem.rating}
              </span>
            )}

            {/* Judge */}
            {problem.judge && (
              <a
                href={
                  problem.judgeUrl ||
                  "#"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="problem-meta-judge"
                onClick={(event) => {
                  if (
                    !problem.judgeUrl
                  ) {
                    event.preventDefault();
                  }
                }}
              >
                {problem.judge}

                {problem.problemNumber
                  ? ` #${problem.problemNumber}`
                  : ""}
              </a>
            )}

            {/* Topics */}
            {problem.topics.length > 0 && (
              <span className="problem-meta-topic">
                {problem.topics.join(
                  " · "
                )}
              </span>
            )}

          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="problem-tabs">

        <button
          className={
            activeTab === "problem"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("problem")
          }
        >
          Problem
        </button>

        <button
          className={
            activeTab === "approach"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("approach")
          }
        >
          Approach
        </button>

        <button
          className={
            activeTab === "solution"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("solution")
          }
        >
          Solution
        </button>

      </nav>

      {/* Content */}
      <main
        className={`problem-details-content ${
          activeTab === "solution"
            ? "solution-active"
            : ""
        }`}
      >

        {/* =========================
            PROBLEM
        ========================= */}

        {activeTab === "problem" && (
          <section>

            {problem.problem && (
              <>
                <p>
                  {getDisplayText(
                    problem.problem
                      .description
                  )}
                </p>

                {/* Examples */}
                {problem.problem.examples?.map(
                  (
                    example,
                    index
                  ) => (
                    <div
                      className="problem-example"
                      key={index}
                    >
                      <h3>
                        Example{" "}
                        {index + 1}
                      </h3>

                      <pre>
{`Input:
${example.input}

Output:
${example.output}`}
                      </pre>

                      {example.explanation && (
                        <p>
                          {getDisplayText(
                            example.explanation
                          )}
                        </p>
                      )}
                    </div>
                  )
                )}

                {/* Constraints */}
                {problem.problem
                  .constraints &&
                  problem.problem
                    .constraints
                    .length > 0 && (
                    <div>
                      <h3>
                        Constraints
                      </h3>

                      <ul>
                        {problem.problem.constraints.map(
                          (
                            constraint,
                            index
                          ) => (
                            <li
                              key={index}
                            >
                              {getDisplayText(
                                constraint
                              )}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </>
            )}

          </section>
        )}

        {/* =========================
            APPROACH
        ========================= */}

        {activeTab === "approach" && (
          <section>

            {problem.approach && (
              <>
                <h2>
                  {getDisplayText(
                    problem.approach.title
                  )}
                </h2>

                {problem.approach.sections.map(
                  (
                    section,
                    index
                  ) => {

                    if (
                      section.type ===
                      "only-text"
                    ) {
                      return (
                        <p key={index}>
                          {getDisplayText(
                            section.content
                          )}
                        </p>
                      );
                    }

                    if (
                      section.type ===
                      "bullet-points"
                    ) {
                      return (
                        <ul key={index}>
                          {section.items.map(
                            (
                              item,
                              itemIndex
                            ) => (
                              <li
                                key={
                                  itemIndex
                                }
                              >
                                {getDisplayText(
                                  item
                                )}
                              </li>
                            )
                          )}
                        </ul>
                      );
                    }

                    return null;
                  }
                )}
              </>
            )}

          </section>
        )}

        {/* =========================
            SOLUTION
        ========================= */}

        {activeTab === "solution" && (
          <section className="problem-solution-section">

            {/* Language Selector */}
            <div className="problem-solution-languages">

              {problem.solutions?.map(
                (item) => (
                  <button
                    key={
                      item.language
                    }
                    className={
                      selectedLanguage ===
                      item.language
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setSelectedLanguage(
                        item.language
                      )
                    }
                  >
                    {item.label}
                  </button>
                )
              )}

            </div>

            {/* Code */}
            {solution && (
              <CodeBlock
                code={solution.code}
                language={
                  solution.language
                }
              />
            )}

          </section>
        )}

      </main>

      {/* Previous / Next */}
      <footer className="topic-navigation">

        {/* Previous */}
        <button
          className="topic-navigation-button previous"
          disabled={!previousProblem}
          onClick={() => {
            if (previousProblem) {
              goToProblem(
                previousProblem
              );
            }
          }}
        >
          <span className="topic-navigation-arrow">
            ←
          </span>

          <span>
            Previous Problem
          </span>
        </button>

        {/* Next */}
        <button
          className="topic-navigation-button next"
          disabled={!nextProblem}
          onClick={() => {
            if (nextProblem) {
              goToProblem(
                nextProblem
              );
            }
          }}
        >
          <span>
            Next Problem
          </span>

          <span className="topic-navigation-arrow">
            →
          </span>
        </button>

      </footer>

    </div>
  );
}

export default ProblemDetails;