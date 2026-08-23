import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getProblemCategory,
} from "../services/courseService";

import type {
  LocalizedText,
  ProblemCategory as ProblemCategoryType,
} from "../types/course";

import "./ProblemCategory.css";

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

function ProblemCategory() {
  const { categorySlug } = useParams<{
    categorySlug: string;
  }>();

  const navigate = useNavigate();

  const [category, setCategory] =
    useState<ProblemCategoryType | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!categorySlug) {
      setError("Invalid problem category");
      setLoading(false);
      return;
    }

    const loadCategory = async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getProblemCategory(
            categorySlug
          );

        setCategory(data);
      } catch (error) {
        console.error(
          "Get problem category error:",
          error
        );

        setError(
          "Failed to load problem category"
        );
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="problem-category-page">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="problem-category-page">
        <p>
          {error ??
            "Problem category not found."}
        </p>
      </div>
    );
  }

  const title = getDisplayText(
    category.title
  );

  const description = getDisplayText(
    category.description
  );

  const openProblem = (
    problemSlug: string
  ) => {
    navigate(
      `/courses/problem-solving/${category.slug}/${problemSlug}`
    );
  };

  return (
    <div className="problem-category-page">
      {/* Gradient top border */}
      <div className="problem-category-gradient-border" />

      {/* Header */}
      <section className="problem-category-header">
        <Link
          to="/courses/problem-solving"
          className="problem-back-link"
        >
          ← Problem Solving
        </Link>

        <p className="section-label">
          PROBLEM SET
        </p>

        <h1>{title}</h1>

        <p>{description}</p>
      </section>

      {/* Problem list */}
      <section className="problem-list">
        <div className="problem-list-header">
          <span>#</span>

          <span>Problem</span>

          <span>Difficulty</span>

          <span>Rating</span>

          <span>Judge</span>
        </div>

        {category.problems.map(
          (problem) => {
            const problemTitle =
              getDisplayText(
                problem.title
              );

            return (
              <div
                key={problem._id}
                className="problem-row"
                role="button"
                tabIndex={0}
                onClick={() =>
                  openProblem(
                    problem.slug
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                      "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();

                    openProblem(
                      problem.slug
                    );
                  }
                }}
              >
                {/* Number */}
                <span className="problem-number">
                  {String(
                    problem.order
                  ).padStart(2, "0")}
                </span>

                {/* Problem name + topics */}
                <div className="problem-name">
                  <strong>
                    {problemTitle}
                  </strong>

                  <small className="problem-topics">
                    {problem.topics.join(
                      " · "
                    )}
                  </small>
                </div>

                {/* Difficulty */}
                <span
                  className={`problem-difficulty problem-difficulty-${problem.difficulty}`}
                >
                  {problem.difficulty}
                </span>

                {/* Rating */}
                <span className="problem-rating">
                  {problem.rating ??
                    "—"}
                </span>

                {/* Judge */}
                {problem.judgeUrl ? (
                  <a
                    href={problem.judgeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="problem-judge"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    {problem.judge}

                    {problem.problemNumber
                      ? ` #${problem.problemNumber}`
                      : ""}
                  </a>
                ) : (
                  <span className="problem-judge">
                    {problem.judge}

                    {problem.problemNumber
                      ? ` #${problem.problemNumber}`
                      : ""}
                  </span>
                )}
              </div>
            );
          }
        )}
      </section>
    </div>
  );
}

export default ProblemCategory;