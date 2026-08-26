import type {
  Course,
  CourseLanguage,
  Topic,
  ProblemCategory,
  Problem,
} from "../types/course";

const API_URL = "http://localhost:5050/api";

/* =========================================
   API TYPES
========================================= */

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

/* =========================================
   API HELPER
========================================= */

const fetchApi = async <T>(
  endpoint: string
): Promise<T> => {
  const response = await fetch(
    `${API_URL}${endpoint}`
  );

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status}`
    );
  }

  const result: {
    success: boolean;
    data: T;
  } = await response.json();

  if (!result.success) {
    throw new Error(
      "API request was unsuccessful"
    );
  }

  return result.data;
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
    const topics =
      course.content?.topics ?? [];

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
    const languages =
      course.languages ?? [];

    const topicsCount =
      languages.reduce(
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

  const topicsCount =
    categories.reduce(
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

export const getCourses = async (): Promise<
  Course[]
> => {
  const data =
    await fetchApi<ApiCourse[]>(
      "/courses"
    );

  return data.map(normalizeCourse);
};

/* =========================================
   GET COURSE BY SLUG
========================================= */

export const getCourseBySlug = async (
  slug: string
): Promise<Course> => {
  const data =
    await fetchApi<ApiCourse>(
      `/courses/${slug}`
    );

  return normalizeCourse(data);
};

/* =========================================
   GET PROBLEM SOLVING COURSE
========================================= */

export const getProblemSolving =
  async (): Promise<Course> => {
    const data =
      await fetchApi<ApiCourse>(
        "/courses/problem-solving"
      );

    return normalizeCourse(data);
  };

/* =========================================
   GET PROBLEM CATEGORY
========================================= */

export const getProblemCategory = async (
  categorySlug: string
): Promise<ProblemCategory> => {
  return fetchApi<ProblemCategory>(
    `/courses/problem-solving/${categorySlug}`
  );
};

/* =========================================
   GET PROBLEM
========================================= */

export const getProblem = async (
  categorySlug: string,
  problemSlug: string
): Promise<Problem> => {
  return fetchApi<Problem>(
    `/courses/problem-solving/${categorySlug}/${problemSlug}`
  );
};