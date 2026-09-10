import type {
  Course,
  CourseLanguage,
  Topic,
  ProblemCategory,
  Problem,
} from "../types/course";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:5050/api";

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

  topicsCount?: number;
  topics?: Topic[];
  languages?: Array<CourseLanguage | { id: string; name: string; color: string; }>;

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
const fetchAuthenticatedApi = async <T>(endpoint: string): Promise<T> => {
  const token = localStorage.getItem("syntaxhub-auth-token");
  if (!token) throw new Error("Authentication required");

  let response: Response | undefined;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      response = await fetch(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      break;
    } catch {
      if (attempt === 1) {
        throw new Error(
          `Unable to connect to SyntaxHub API at ${API_URL}. Make sure the backend is running on port 5050.`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  if (!response) throw new Error("Unable to connect to SyntaxHub API.");

  const raw = await response.text();
  let result: { success: boolean; data: T; message?: string } | null = null;
  try {
    result = raw ? JSON.parse(raw) : null;
  } catch {
    throw new Error(`SyntaxHub API returned an invalid response (${response.status}).`);
  }

  if (!response.ok) throw new Error(result?.message ?? `API request failed: ${response.status}`);
  if (!result?.success) throw new Error(result?.message ?? "API request was unsuccessful");
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
      course.topics ?? course.content?.topics ?? [];

    return {
      _id: course._id,
      title: course.title,
      slug: course.slug,
      category: course.category,
      type: "single-language",
      description: course.description,
      level: course.level,
      topicsCount: course.topicsCount ?? topics.length,
      topics,
    };
  }

  /* =========================================
     MULTI LANGUAGE
  ========================================= */

  if (course.type === "multi-language") {
    const languages = (course.languages ?? []).map((language) => ({
      id: language.id,
      name: language.name,
      color: language.color,
      topics: "topics" in language ? language.topics : [],
    }));

    const topicsCount =
      course.topicsCount ??
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

export const getSearchCourses = async (): Promise<Course[]> => {
  const data = await fetchAuthenticatedApi<ApiCourse[]>("/courses/search-index");
  return data.map(normalizeCourse);
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

export const getCoursePreview = async (
  slug: string
): Promise<Course> => {
  const data = await fetchApi<ApiCourse>(`/courses/preview/${slug}`);
  return normalizeCourse(data);
};

export const getCourseBySlug = async (
  slug: string
): Promise<Course> => {
  const data =
    await fetchAuthenticatedApi<ApiCourse>(
      `/courses/${slug}`
    );

  return normalizeCourse(data);
};

/* =========================================
   GET PROBLEM SOLVING COURSE
========================================= */

export const getProblemSolving =
  async (): Promise<
    Extract<Course, { type: "problem-solving" }>
  > => {
    const data =
      await fetchApi<ApiCourse>(
        "/courses/problem-solving"
      );

    const course = normalizeCourse(data);

    if (course.type !== "problem-solving") {
      throw new Error(
        "Invalid problem solving course response"
      );
    }

    return course;
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
  return fetchAuthenticatedApi<Problem>(
    `/courses/problem-solving/${categorySlug}/${problemSlug}`
  );
};