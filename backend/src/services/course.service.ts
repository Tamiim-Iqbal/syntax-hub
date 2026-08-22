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