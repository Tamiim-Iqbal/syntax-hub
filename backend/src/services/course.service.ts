import Course, { type ICourse } from "../models/Course.js";

export const getAllCourses = async (): Promise<ICourse[]> => {
  return Course.find()
    .sort({ order: 1, createdAt: -1 })
    .lean();
};

export const getCourseBySlug = async (
  slug: string
): Promise<ICourse | null> => {
  return Course.findOne({ slug }).lean();
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
      new: true,
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
  return Course.findOne({
    slug: "problem-solving",
    type: "problem-solving",
  }).lean();
};

export const getProblemCategory = async (
  categorySlug: string
) => {
  const course = await Course.findOne({
    slug: "problem-solving",
    type: "problem-solving",
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