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

const getTopicCount = (course: any) => {
  const content = course.content && typeof course.content === "object" ? course.content : {};
  if (course.type === "single-language") return Array.isArray(content.topics) ? content.topics.length : 0;
  if (course.type === "multi-language") {
    const languages = Array.isArray(course.languages) ? course.languages : (Array.isArray(content.languages) ? content.languages : []);
    return languages.reduce((total: number, language: any) => total + (Array.isArray(language.topics) ? language.topics.length : 0), 0);
  }
  const categories = Array.isArray(content.categories) ? content.categories : [];
  return categories.reduce((total: number, category: any) => total + (Array.isArray(category.problems) ? category.problems.length : 0), 0);
};

const toPublicSummary = (course: any) => ({
  _id: course._id,
  title: course.title,
  slug: course.slug,
  category: course.category,
  type: course.type,
  description: course.description,
  level: course.level,
  topicsCount: getTopicCount(course),
  languages: course.type === "multi-language"
    ? (Array.isArray(course.languages) ? course.languages : []).map((language: any) => ({ id: language.id, name: language.name, color: language.color }))
    : undefined,
  isPublished: course.isPublished,
  order: course.order,
});


const toCoursePreview = (course: any) => {
  const previewTopic = (topic: any) => ({
    _id: topic._id,
    title: topic.title,
    slug: topic.slug,
    order: topic.order,
    language: topic.language,
    subtopics: Array.isArray(topic.subtopics)
      ? topic.subtopics.map((subtopic: any) => ({
          _id: subtopic._id,
          title: subtopic.title,
          slug: subtopic.slug,
          order: subtopic.order,
          language: subtopic.language,
        }))
      : [],
  });

  const preview: any = {
    _id: course._id,
    title: course.title,
    slug: course.slug,
    category: course.category,
    type: course.type,
    description: course.description,
    level: course.level,
    topicsCount: getTopicCount(course),
  };

  if (course.type === "single-language") {
    preview.topics = Array.isArray(course.content?.topics)
      ? course.content.topics.map(previewTopic)
      : [];
  } else if (course.type === "multi-language") {
    const languages = Array.isArray(course.languages)
      ? course.languages
      : Array.isArray(course.content?.languages)
        ? course.content.languages
        : [];
    preview.languages = languages.map((language: any) => ({
      id: language.id,
      name: language.name,
      color: language.color,
      topics: Array.isArray(language.topics)
        ? language.topics.map(previewTopic)
        : [],
    }));
  }

  return preview;
};

export const getCoursePreview = async (slug: string): Promise<any | null> => {
  const course = await Course.findOne({ slug, isPublished: true }).lean();
  return course ? toCoursePreview(course) : null;
};

export const getAllCourses = async (): Promise<any[]> => {
  const courses = await Course.find({ isPublished: true })
    .sort({ order: 1, createdAt: -1 })
    .lean();
  return courses.map(toPublicSummary);
};

export const getSearchCourses = async (): Promise<ICourse[]> => {
  const courses = await Course.find({ isPublished: true })
    .sort({ order: 1, createdAt: -1 })
    .lean();
  return courses.map(normalizeCourseForClient) as ICourse[];
};

export const getCourseBySlug = async (slug: string): Promise<ICourse | null> => {
  const course = await Course.findOne({ slug, isPublished: true }).lean();
  return normalizeCourseForClient(course) as ICourse | null;
};

export const createCourse = async (courseData: Partial<ICourse>): Promise<ICourse> => Course.create(courseData);

export const updateCourse = async (id: string, courseData: Partial<ICourse>): Promise<ICourse | null> =>
  Course.findByIdAndUpdate(id, courseData, { returnDocument: "after", runValidators: true }).lean();

export const deleteCourse = async (id: string): Promise<ICourse | null> => Course.findByIdAndDelete(id).lean();

const toProblemPreview = (problem: any) => ({
  _id: problem._id,
  title: problem.title,
  slug: problem.slug,
  order: problem.order,
  difficulty: problem.difficulty,
  rating: problem.rating,
  judge: problem.judge,
  judgeUrl: problem.judgeUrl,
  problemNumber: problem.problemNumber,
  topics: problem.topics,
});

const toProblemCategoryPreview = (category: any) => ({
  _id: category._id,
  title: category.title,
  slug: category.slug,
  description: category.description,
  order: category.order,
  problems: Array.isArray(category.problems)
    ? category.problems.map(toProblemPreview)
    : [],
});

export const getProblemSolvingPreview = async () => {
  const course = await Course.findOne({ slug: "problem-solving", type: "problem-solving", isPublished: true }).lean();
  if (!course) return null;
  const categories = Array.isArray((course.content as any)?.categories)
    ? (course.content as any).categories.map(toProblemCategoryPreview)
    : [];
  return {
    _id: course._id,
    title: course.title,
    slug: course.slug,
    category: course.category,
    type: course.type,
    description: course.description,
    level: course.level,
    topicsCount: categories.reduce((total: number, category: any) => total + category.problems.length, 0),
    problemSolvingCategories: categories,
  };
};

export const getProblemCategoryPreview = async (categorySlug: string) => {
  const course = await Course.findOne({ slug: "problem-solving", type: "problem-solving", isPublished: true }).lean();
  if (!course) return null;
  const categories = Array.isArray((course.content as any)?.categories) ? (course.content as any).categories : [];
  const category = categories.find((item: any) => item.slug === categorySlug);
  return category ? toProblemCategoryPreview(category) : null;
};

export const getProblemSolvingCourse = async (): Promise<ICourse | null> => {
  const course = await Course.findOne({ slug: "problem-solving", type: "problem-solving", isPublished: true }).lean();
  return normalizeCourseForClient(course) as ICourse | null;
};

export const getProblemCategory = async (categorySlug: string) => {
  const course = await Course.findOne({ slug: "problem-solving", type: "problem-solving", isPublished: true }).lean();
  if (!course) return null;
  const content = course.content as { categories?: Array<{ slug: string; [key: string]: unknown }> };
  return content.categories?.find((item) => item.slug === categorySlug) ?? null;
};

export const getProblemBySlug = async (categorySlug: string, problemSlug: string) => {
  const course = await Course.findOne({ slug: "problem-solving", type: "problem-solving", isPublished: true }).lean();
  if (!course) return null;
  const content = course.content as { categories?: Array<{ slug: string; problems?: Array<{ slug: string; [key: string]: unknown }> }> };
  const category = content.categories?.find((item) => item.slug === categorySlug);
  if (!category) return null;
  return category.problems?.find((item) => item.slug === problemSlug) ?? null;
};
