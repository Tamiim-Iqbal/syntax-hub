import type { Course } from "../types/course";

const API_URL = "http://localhost:5050/api";

type ApiCourse = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  level: string;
  content?: {
    topics?: Course extends infer T
      ? T extends { topics: infer Topics }
        ? Topics
        : never
      : never;
  };
  languages?: Course extends infer T
    ? T extends { languages: infer Languages }
      ? Languages
      : never: never;
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

const normalizeCourse = (
  course: ApiCourse
): Course => {
  const baseCourse = {
    _id: course._id,
    title: course.title,
    slug: course.slug,
    category: course.category,
    description: course.description,
    level: course.level,
    topicsCount:
      course.content?.topics?.length ?? 0,
  };

  if (course.languages) {
    return {
      ...baseCourse,
      languages: course.languages,
    } as Course;
  }

  return {
    ...baseCourse,
    topics: course.content?.topics ?? [],
  } as Course;
};

export const getCourses = async (): Promise<Course[]> => {
  const response = await fetch(
    `${API_URL}/courses`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }

  const result: CoursesResponse =
    await response.json();

  return result.data.map(normalizeCourse);
};

export const getCourseBySlug = async (
  slug: string
): Promise<Course> => {
  const response = await fetch(
    `${API_URL}/courses/${slug}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch course");
  }

  const result: CourseResponse =
    await response.json();

  return normalizeCourse(result.data);
};