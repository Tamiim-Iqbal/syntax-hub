import Course, { type ICourse } from "../models/Course.js";

const normalizeCourseForClient = (course: any) => {
  if (!course) return course;
  const content = course.content && typeof course.content === "object" ? course.content : {};
  const normalized: any = { ...course };
  if (course.type === "single-language") normalized.topics = content.topics ?? [];
  if (course.type === "multi-language") normalized.languages = course.languages ?? content.languages ?? [];
  if (course.type === "problem-solving") normalized.problemSolvingCategories = content.categories ?? [];
  return normalized;
};

export const getAllCourses = async (): Promise<ICourse[]> => {
  const courses = await Course.find({ isPublished: true })
    .sort({ order: 1, createdAt: -1 })
    .lean();
  return courses.map(normalizeCourseForClient) as ICourse[];
};

export const getCourseBySlug = async (
  slug: string
): Promise<ICourse | null> => {
  const course = await Course.findOne({ slug, isPublished: true }).lean();
  return normalizeCourseForClient(course) as ICourse | null;
};

export const createCourse = async (
  courseData: Partial<ICourse>
): Promise<ICourse> => {
  const course = await Course.create(courseData);

  return course;
};

export const updateCourse = async (
  id: string,
  courseData: Partial<ICourse>
): Promise<ICourse | null> => {
  return Course.findByIdAndUpdate(
    id,
    courseData,
    {
      returnDocument: "after",
      runValidators: true,
    }
  ).lean();
};

export const deleteCourse = async (
  id: string
): Promise<ICourse | null> => {
  return Course.findByIdAndDelete(id).lean();
};

export const getProblemSolvingCourse = async (): Promise<ICourse | null> => {
  const course = await Course.findOne({
    slug: "problem-solving",
    type: "problem-solving",
    isPublished: true,
  }).lean();
  return normalizeCourseForClient(course) as ICourse | null;
};

export const getProblemCategory = async (
  categorySlug: string
) => {
  const course = await Course.findOne({
    slug: "problem-solving",
    type: "problem-solving",
    isPublished: true,
  }).lean();

  if (!course) {
    return null;
  }

  const content = course.content as {
    categories?: Array<{
      slug: string;
      [key: string]: unknown;
    }>;
  };

  const category = content.categories?.find(
    (item) => item.slug === categorySlug
  );

  return category ?? null;
};

export const getProblemBySlug = async (
  categorySlug: string,
  problemSlug: string
) => {
  const course = await Course.findOne({
    slug: "problem-solving",
    type: "problem-solving",
    isPublished: true,
  }).lean();

  if (!course) {
    return null;
  }

  const content = course.content as {
    categories?: Array<{
      slug: string;
      problems?: Array<{
        slug: string;
        [key: string]: unknown;
      }>;
    }>;
  };

  const category = content.categories?.find(
    (item) => item.slug === categorySlug
  );

  if (!category) {
    return null;
  }

  const problem = category.problems?.find(
    (item) => item.slug === problemSlug
  );

  return problem ?? null;
};