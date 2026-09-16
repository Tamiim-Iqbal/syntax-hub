import type {
  Course,
  CourseLanguage,
  Topic,
  ProblemCategory,
  Problem,
  NestedCourseItem,
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
    | "problem-solving"
    | "nested";

  description: string;
  level: string;

  content?: {
    topics?: Topic[];
    categories?: ProblemCategory[];
    courses?: NestedCourseItem[];
    languages?: Array<CourseLanguage | { id: string; name: string; color: string; topics?: Topic[] }>;
  };

  topicsCount?: number;
  isTopLevel?: boolean;
  topics?: Topic[];
  languages?: Array<CourseLanguage | { id: string; name: string; color: string; topics?: Topic[] }>;
  nestedCourses?: NestedCourseItem[];
  problemSolvingCategories?: ProblemCategory[];

  isPublished: boolean;
  order: number;
};

/* =========================================
   API HELPER
========================================= */

const fetchApi = async <T>(
  endpoint: string
): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    cache: "default",
  });

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
  let result: { success: boolean; data: T; message?: string } | null;
  try {
    result = raw ? JSON.parse(raw) as { success: boolean; data: T; message?: string } : null;
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
      topicsCount: topics.length || Number(course.topicsCount) || 0,
      topics,
    };
  }

  /* =========================================
     MULTI LANGUAGE
  ========================================= */

  if (course.type === "multi-language") {
    const rawLanguages = Array.isArray(course.languages) && course.languages.length
      ? course.languages
      : course.content?.languages ?? [];
    const languages = rawLanguages.map((language) => ({
      id: language.id,
      name: language.name,
      color: language.color,
      topics: "topics" in language && Array.isArray(language.topics) ? language.topics : [],
    }));

    const derivedTopicCount = languages.reduce(
      (total, language) =>
        total + language.topics.length,
      0
    );
    const topicsCount = derivedTopicCount || Number(course.topicsCount) || 0;

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
     NESTED COURSE
  ========================================= */

  if (course.type === "nested") {
    const nestedCourses = Array.isArray(course.nestedCourses) && course.nestedCourses.length > 0
      ? course.nestedCourses
      : Array.isArray((course as any).content?.courses)
        ? (course as any).content.courses
        : [];

    return {
      _id: course._id,
      title: course.title,
      slug: course.slug,
      category: course.category,
      type: "nested",
      description: course.description,
      level: course.level,
      topicsCount: nestedCourses.length || Number(course.topicsCount) || 0,
      nestedCourses: nestedCourses as NestedCourseItem[],
    };
  }

  /* =========================================
     PROBLEM SOLVING
  ========================================= */

  const rootCategories = Array.isArray(course.problemSolvingCategories)
    ? course.problemSolvingCategories
    : [];
  const contentCategories = Array.isArray((course as any).content?.categories)
    ? (course as any).content.categories
    : [];
  const legacyCategories = Array.isArray((course as any).content?.problemSolvingCategories)
    ? (course as any).content.problemSolvingCategories
    : [];

  const categories =
    rootCategories.length > 0
      ? rootCategories
      : contentCategories.length > 0
        ? contentCategories
        : legacyCategories;

  const derivedProblemCount =
    categories.reduce(
      (total: number, category: ProblemCategory) =>
        total + (Array.isArray(category.problems) ? category.problems.length : 0),
      0
    );

  // The public /courses endpoint intentionally returns only summary metadata,
  // so problem-solving categories are not present there. Use the server's
  // computed topicsCount in that case instead of falling back to 0.
  const topicsCount =
    derivedProblemCount > 0
      ? derivedProblemCount
      : Number(course.topicsCount) || 0;

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

const COURSE_CACHE_KEY = "syntaxhub:courses:v2";
const COURSE_MEMORY_TTL = 60_000;
const COURSE_STORAGE_TTL = 5 * 60_000;

let coursesCache: { data: Course[]; expiresAt: number } | null = null;
let coursesPromise: Promise<Course[]> | null = null;

const readPersistedCourses = (): Course[] | null => {
  try {
    const raw = localStorage.getItem(COURSE_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      data?: Course[];
      savedAt?: number;
    };

    if (!Array.isArray(parsed.data) || typeof parsed.savedAt !== "number") {
      return null;
    }

    if (Date.now() - parsed.savedAt > COURSE_STORAGE_TTL) {
      localStorage.removeItem(COURSE_CACHE_KEY);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
};

const persistCourses = (courses: Course[]) => {
  try {
    localStorage.setItem(
      COURSE_CACHE_KEY,
      JSON.stringify({ data: courses, savedAt: Date.now() })
    );
  } catch {
    // Storage can be unavailable/full; the in-memory cache still works.
  }
};

const refreshCourses = async (): Promise<Course[]> => {
  const courses = await fetchApi<ApiCourse[]>("/courses");
  const normalized = courses.map(normalizeCourse);

  coursesCache = {
    data: normalized,
    expiresAt: Date.now() + COURSE_MEMORY_TTL,
  };
  persistCourses(normalized);

  return normalized;
};

export const getCourses = async (): Promise<Course[]> => {
  const now = Date.now();

  if (coursesCache && coursesCache.expiresAt > now) {
    return coursesCache.data;
  }

  // Persist the course list across page reloads. This makes repeat visits
  // instant while the API refreshes in the background.
  const persisted = readPersistedCourses();
  if (persisted) {
    coursesCache = {
      data: persisted,
      expiresAt: now + COURSE_MEMORY_TTL,
    };

    if (!coursesPromise) {
      coursesPromise = refreshCourses().finally(() => {
        coursesPromise = null;
      });
      void coursesPromise.catch((error) => {
        console.warn("Background course refresh failed:", error);
      });
    }

    return persisted;
  }

  if (coursesPromise) return coursesPromise;

  coursesPromise = refreshCourses().finally(() => {
    coursesPromise = null;
  });

  return coursesPromise;
};

export const clearCourseListCache = () => {
  coursesCache = null;
  try {
    localStorage.removeItem(COURSE_CACHE_KEY);
  } catch {
    // Ignore storage errors.
  }
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