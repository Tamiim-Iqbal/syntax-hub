import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getProblemSolving,
} from "../services/courseService";

import type {
  ProblemSolvingCourse,
  ProblemCategory,
} from "../types/course";

import { getDisplayText } from "../utils/localizedText";


import ProblemCategorySkeleton from "../components/ProblemCategorySkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

import "./ProblemSolving.css";



function ProblemSolving() {
  const [course, setCourse] =
    useState<ProblemSolvingCourse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /* =========================
     RETRY
  ========================= */

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getProblemSolving();

      if (
        data.type !==
        "problem-solving"
      ) {
        throw new Error(
          "Invalid problem solving course"
        );
      }

      setCourse(data);
    } catch (error) {
      console.error(
        "Failed to load problem solving course:",
        error
      );

      setError(
        "Failed to load problem solving course."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data =
          await getProblemSolving();

        if (
          data.type !==
          "problem-solving"
        ) {
          throw new Error(
            "Invalid problem solving course"
          );
        }

        if (!cancelled) {
          setCourse(data);
          setError(null);
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Failed to load problem solving course:",
          error
        );

        if (!cancelled) {
          setError(
            "Failed to load problem solving course."
          );

          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return <ProblemCategorySkeleton />;
  }

  /* =========================
     ERROR
  ========================= */

  if (error || !course) {
    return (
      <div className="problem-solving-page">
        <ErrorState
          message={
            error ??
            "Problem solving course not found."
          }
          onRetry={loadCourse}
        />
      </div>
    );
  }

  /* =========================
     CONTENT
  ========================= */

  return (
    <div className="problem-solving-page">
      {/* Gradient top border */}
      <div className="problem-solving-gradient-border" />

      {/* Header */}
      <section className="problem-solving-header">
        <p className="section-label">
          PROBLEM SOLVING
        </p>

        <h1>{course.title}</h1>

        <p>{course.description}</p>
      </section>

      {/* =========================
          EMPTY
      ========================= */}

      {course.problemSolvingCategories.length ===
      0 ? (
        <EmptyState
          title="No problem sets available"
          message="There are no problem-solving categories available right now."
        />
      ) : (
        /* =========================
           CATEGORY CARDS
        ========================= */

        <section className="problem-category-grid">
          {course.problemSolvingCategories.map(
            (
              category: ProblemCategory
            ) => {
              const title =
                getDisplayText(
                  category.title
                );

              const description =
                getDisplayText(
                  category.description
                );

              const problemCount =
                category.problems.length;

              return (
                <article
                  key={category._id}
                  className="course-card problem-category-card"
                >
                  {/* Top */}
                  <div className="course-card-top">
                    <span className="course-card-category">
                      PROBLEM SET
                    </span>
                  </div>

                  {/* Content */}
                  <div className="course-card-content">
                    <h3>{title}</h3>

                    <p>{description}</p>
                  </div>

                  {/* Footer */}
                  <div className="course-card-footer">
                    <span className="course-card-topics">
                      {problemCount}{" "}
                      {problemCount === 1
                        ? "Problem"
                        : "Problems"}
                    </span>

                    <Link
                      to={`/courses/problem-solving/${category.slug}`}
                      className="course-card-button"
                    >
                      Explore →
                    </Link>
                  </div>
                </article>
              );
            }
          )}
        </section>
      )}
    </div>
  );
}

export default ProblemSolving;