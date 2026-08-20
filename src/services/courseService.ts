import { courses, type Course } from "../mock/Courses";

export function getAllCourses(): Course[] {
  return courses;
}

export function getCourseBySlug(
  slug: string
): Course | undefined {
  return courses.find(
    (course) => course.slug === slug
  );
}