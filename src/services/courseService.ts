import type {
  Course,
  CourseLanguage,
  Topic,
  ProblemCategory,
} from "../types/course";

const API_URL = "http://localhost:5050/api";

type ApiCourse = {
  _id: string;
  title: string;
  slug: string;
  category: string;

  type:
    | "single-language"
    | "multi-language"
    | "problem-solving";

  description: string;
  level: string;

  content?: {
    topics?: Topic[];

    categories?: ProblemCategory[];
  };

  languages?: CourseLanguage[];

  isPublished: boolean;
  order: number;
};

type CoursesResponse = {
  success: boolean;
  data: ApiCourse[];
};

type CourseResponse = {
  success: boolean;
  data: ApiCourse;
};

/* =========================================
   NORMALIZE COURSE
========================================= */

const normalizeCourse = (
  course: ApiCourse
): Course => {
  /* =========================================
     SINGLE LANGUAGE
  ========================================= */

  if (course.type === "single-language") {
    const topics = course.content?.topics ?? [];

    return {
      _id: course._id,
      title: course.title,
      slug: course.slug,
      category: course.category,
      type: "single-language",
      description: course.description,
      level: course.level,
      topicsCount: topics.length,
      topics,
    };
  }

  /* =========================================
     MULTI LANGUAGE
  ========================================= */

  if (course.type === "multi-language") {
    const languages = course.languages ?? [];

    const topicsCount = languages.reduce(
      (total, language) =>
        total + language.topics.length,
      0
    );

    return {
      _id: course._id,
      title: course.title,
      slug: course.slug,
      category: course.category,
      type: "multi-language",
      description: course.description,
      level: course.level,
      topicsCount,
      languages,
    };
  }

  /* =========================================
     PROBLEM SOLVING
  ========================================= */

  const categories =
    course.content?.categories ?? [];

  const topicsCount = categories.reduce(
    (total, category) =>
      total + category.problems.length,
    0
  );

  return {
    _id: course._id,
    title: course.title,
    slug: course.slug,
    category: course.category,
    type: "problem-solving",
    description: course.description,
    level: course.level,
    topicsCount,
    problemSolvingCategories:
      categories,
  };
};

/* =========================================
   GET ALL COURSES
========================================= */

export const getCourses = async (): Promise<Course[]> => {
  const response = await fetch(
    `${API_URL}/courses`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch courses"
    );
  }

  const result: CoursesResponse =
    await response.json();

  return result.data.map(normalizeCourse);
};

/* =========================================
   GET COURSE BY SLUG
========================================= */

export const getCourseBySlug = async (
  slug: string
): Promise<Course> => {
  const response = await fetch(
    `${API_URL}/courses/${slug}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch course"
    );
  }

  const result: CourseResponse =
    await response.json();

  return normalizeCourse(result.data);
};

/* =========================================
   PROBLEM SOLVING
========================================= */

export const getProblemSolving =
  async (): Promise<Course> => {
    const response = await fetch(
      `${API_URL}/courses/problem-solving`
    );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch problem solving course"
      );
    }

    const result: CourseResponse =
      await response.json();

    return normalizeCourse(result.data);
  };

/* =========================================
   GET PROBLEM CATEGORY
========================================= */

export const getProblemCategory = async (
  categorySlug: string
) => {
  const response = await fetch(
    `${API_URL}/courses/problem-solving/${categorySlug}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch problem category"
    );
  }

  const result = await response.json();

  return result.data;
};

/* =========================================
   GET PROBLEM
========================================= */

export const getProblem = async (
  categorySlug: string,
  problemSlug: string
) => {
  const response = await fetch(
    `${API_URL}/courses/problem-solving/${categorySlug}/${problemSlug}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch problem"
    );
  }

  const result = await response.json();

  return result.data;
};