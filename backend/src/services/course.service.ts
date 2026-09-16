import Course, { type ICourse } from "../models/Course.js";
import type { PipelineStage } from "mongoose";

const getCourseContent = (course: any) =>
  course?.content && typeof course.content === "object"
    ? course.content
    : {};

/**
 * Multi-language courses have existed in two shapes in the project:
 *
 * 1. course.languages
 * 2. course.content.languages
 *
 * Some older documents can have an empty `course.languages` array while the
 * real topics still live under `content.languages`. Always prefer the source
 * that actually contains topics so public course cards never report 0 by
 * mistake.
 */
const getCourseLanguages = (course: any): any[] => {
  const content = getCourseContent(course);
  const topLevelLanguages = Array.isArray(course?.languages)
    ? course.languages
    : [];
  const contentLanguages = Array.isArray(content.languages)
    ? content.languages
    : [];

  const topLevelTopicCount = topLevelLanguages.reduce(
    (total: number, language: any) =>
      total + (Array.isArray(language?.topics) ? language.topics.length : 0),
    0
  );

  const contentTopicCount = contentLanguages.reduce(
    (total: number, language: any) =>
      total + (Array.isArray(language?.topics) ? language.topics.length : 0),
    0
  );

  if (topLevelTopicCount > 0) return topLevelLanguages;
  if (contentTopicCount > 0) return contentLanguages;
  if (contentLanguages.length > 0) return contentLanguages;
  return topLevelLanguages;
};

const getTopicCount = (course: any): number => {
  const content = getCourseContent(course);

  if (course?.type === "single-language") {
    const topics = Array.isArray(content.topics) ? content.topics : [];
    return topics.length;
  }

  if (course?.type === "multi-language") {
    const languages = getCourseLanguages(course);
    return languages.reduce(
      (total: number, language: any) =>
        total + (Array.isArray(language?.topics) ? language.topics.length : 0),
      0
    );
  }

  if (course?.type === "nested") {
    const contentCourses = Array.isArray(content.courses) ? content.courses : [];
    const rootCourses = Array.isArray(course?.nestedCourses) ? course.nestedCourses : [];
    return contentCourses.length > 0 ? contentCourses.length : rootCourses.length;
  }

  const contentCategories = Array.isArray(content.categories) ? content.categories : [];
  const legacyContentCategories = Array.isArray(content.problemSolvingCategories)
    ? content.problemSolvingCategories
    : [];
  const rootCategories = Array.isArray(course?.problemSolvingCategories)
    ? course.problemSolvingCategories
    : [];

  const categories =
    contentCategories.length > 0
      ? contentCategories
      : legacyContentCategories.length > 0
        ? legacyContentCategories
        : rootCategories;

  // Problem Solving's count is the total number of problems across all
  // categories, not the number of categories.
  return categories.reduce(
    (total: number, category: any) =>
      total + (Array.isArray(category?.problems) ? category.problems.length : 0),
    0
  );
};

const normalizeCourseForClient = (course: any) => {
  if (!course) return course;

  const content = getCourseContent(course);
  const normalized: any = { ...course };

  if (course.type === "single-language") {
    normalized.topics = Array.isArray(content.topics) ? content.topics : [];
  }

  if (course.type === "multi-language") {
    normalized.languages = getCourseLanguages(course);
  }

  if (course.type === "nested") {
    const nestedCourses = Array.isArray(content.courses)
      ? content.courses
      : Array.isArray(course?.nestedCourses)
        ? course.nestedCourses
        : [];
    normalized.nestedCourses = nestedCourses.map((item: any) => ({ ...item, type: item.type ?? "single-language" }));
  }

  if (course.type === "problem-solving") {
    const categories = Array.isArray(content.categories) && content.categories.length > 0
      ? content.categories
      : Array.isArray(content.problemSolvingCategories) && content.problemSolvingCategories.length > 0
        ? content.problemSolvingCategories
        : Array.isArray(course?.problemSolvingCategories)
          ? course.problemSolvingCategories
          : [];
    normalized.problemSolvingCategories = categories.map((category: any) => ({
      ...category,
      problems: Array.isArray(category?.problems) ? category.problems : [],
    }));
  }

  return normalized;
};

const toPublicSummary = (course: any) => {
  const languages =
    course.type === "multi-language" ? getCourseLanguages(course) : [];

  return {
    _id: course._id,
    title: course.title,
    slug: course.slug,
    category: course.category,
    type: course.type,
    description: course.description,
    level: course.level,
    topicsCount: getTopicCount(course),
    languages:
      course.type === "multi-language"
        ? languages.map((language: any) => ({
            id: language.id,
            name: language.name,
            color: language.color,
          }))
        : undefined,
    isPublished: course.isPublished,
    isTopLevel: course.isTopLevel !== false,
    order: course.order,
  };
};

const toCoursePreview = async (course: any) => {
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
    const content = getCourseContent(course);
    preview.topics = Array.isArray(content.topics)
      ? content.topics.map(previewTopic)
      : [];
  } else if (course.type === "multi-language") {
    preview.languages = getCourseLanguages(course).map((language: any) => ({
      id: language.id,
      name: language.name,
      color: language.color,
      topics: Array.isArray(language.topics)
        ? language.topics.map(previewTopic)
        : [],
    }));
  } else if (course.type === "nested") {
    const content = getCourseContent(course);
    const refs = Array.isArray(content.courses) && content.courses.length > 0
      ? content.courses
      : Array.isArray(course?.nestedCourses)
        ? course.nestedCourses
        : [];
    const ids = refs.map((item: any) => String(item?._id ?? item?.id ?? item?.courseId ?? "")).filter(Boolean);
    const slugs = refs.map((item: any) => String(item?.slug ?? "")).filter(Boolean);
    const children = ids.length || slugs.length
      ? await Course.find({
          isPublished: true,
          $or: [
            ...(ids.length ? [{ _id: { $in: ids.filter((id: string) => /^[a-f0-9]{24}$/i.test(id)) } }] : []),
            ...(slugs.length ? [{ slug: { $in: slugs } }] : []),
          ],
        })
          .select("_id title slug category type description level isPublished order content languages")
          .lean()
      : [];
    const byId = new Map(children.map((child: any) => [String(child._id), child]));
    const bySlug = new Map(children.map((child: any) => [child.slug, child]));
    preview.nestedCourses = refs.map((ref: any, index: number) => {
      const child = byId.get(String(ref?._id ?? ref?.id ?? ref?.courseId ?? "")) ?? bySlug.get(String(ref?.slug ?? ""));
      if (!child) return null;
      return {
        _id: child._id,
        type: child.type,
        title: child.title,
        slug: child.slug,
        category: child.category,
        description: child.description,
        level: child.level,
        topicsCount: getTopicCount(child),
        order: ref?.order ?? child.order ?? index + 1,
      };
    }).filter(Boolean).sort((a: any, b: any) => a.order - b.order);
  }

  return preview;
};

export const getCoursePreview = async (slug: string): Promise<any | null> => {
  const course = await Course.findOne({ slug, isPublished: true }).lean();
  return course ? await toCoursePreview(course) : null;
};

const COURSE_LIST_CACHE_TTL = 60_000;
let courseListCache: { data: any[]; expiresAt: number } | null = null;
let courseListPromise: Promise<any[]> | null = null;

/**
 * Public course cards must never read the large `content` blob from MongoDB.
 * The aggregation calculates counts inside MongoDB and returns only the
 * metadata required by the course cards.
 */
const COURSE_SUMMARY_PIPELINE: PipelineStage[] = [
  {
    $match: {
      isPublished: true,
      isTopLevel: { $ne: false },
    },
  },
  {
    $set: {
      _content: {
        $cond: [
          { $eq: [{ $type: "$content" }, "object"] },
          "$content",
          {},
        ],
      },
    },
  },
  {
    $set: {
      topicsCount: {
        $switch: {
          branches: [
            {
              case: { $eq: ["$type", "single-language"] },
              then: { $size: { $ifNull: ["$_content.topics", []] } },
            },
            {
              case: { $eq: ["$type", "multi-language"] },
              then: {
                $let: {
                  vars: {
                    rootLanguages: { $ifNull: ["$languages", []] },
                    contentLanguages: { $ifNull: ["$_content.languages", []] },
                  },
                  in: {
                    $let: {
                      vars: {
                        rootTopicCount: {
                          $reduce: {
                            input: { $ifNull: ["$languages", []] },
                            initialValue: 0,
                            in: {
                              $add: [
                                "$$value",
                                { $size: { $ifNull: ["$$this.topics", []] } },
                              ],
                            },
                          },
                        },
                      },
                      in: {
                        $reduce: {
                          input: {
                            $cond: [
                              { $gt: ["$$rootTopicCount", 0] },
                              "$$rootLanguages",
                              "$$contentLanguages",
                            ],
                          },
                          initialValue: 0,
                          in: {
                            $add: [
                              "$$value",
                              { $size: { $ifNull: ["$$this.topics", []] } },
                            ],
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            {
              case: { $eq: ["$type", "nested"] },
              then: {
                $let: {
                  vars: {
                    contentCourses: { $ifNull: ["$_content.courses", []] },
                    rootCourses: { $ifNull: ["$nestedCourses", []] },
                  },
                  in: {
                    $cond: [
                      { $gt: [{ $size: "$$contentCourses" }, 0] },
                      { $size: "$$contentCourses" },
                      { $size: "$$rootCourses" },
                    ],
                  },
                },
              },
            },
            {
              case: { $eq: ["$type", "problem-solving"] },
              then: {
                $let: {
                  vars: {
                    categories: {
                      $cond: [
                        { $gt: [{ $size: { $ifNull: ["$_content.categories", []] } }, 0] },
                        { $ifNull: ["$_content.categories", []] },
                        {
                          $cond: [
                            { $gt: [{ $size: { $ifNull: ["$_content.problemSolvingCategories", []] } }, 0] },
                            { $ifNull: ["$_content.problemSolvingCategories", []] },
                            { $ifNull: ["$problemSolvingCategories", []] },
                          ],
                        },
                      ],
                    },
                  },
                  in: {
                    $reduce: {
                      input: "$$categories",
                      initialValue: 0,
                      in: {
                        $add: [
                          "$$value",
                          { $size: { $ifNull: ["$$this.problems", []] } },
                        ],
                      },
                    },
                  },
                },
              },
            },
          ],
          default: 0,
        },
      },
    },
  },
  {
    $project: {
      _id: 1,
      title: 1,
      slug: 1,
      category: 1,
      type: 1,
      description: 1,
      level: 1,
      topicsCount: 1,
      isPublished: 1,
      isTopLevel: 1,
      order: 1,
      languages: {
        $cond: [
          { $eq: ["$type", "multi-language"] },
          {
            $let: {
              vars: {
                rootLanguages: { $ifNull: ["$languages", []] },
                contentLanguages: { $ifNull: ["$_content.languages", []] },
              },
              in: {
                $let: {
                  vars: {
                    rootTopicCount: {
                      $reduce: {
                        input: { $ifNull: ["$languages", []] },
                        initialValue: 0,
                        in: {
                          $add: [
                            "$$value",
                            { $size: { $ifNull: ["$$this.topics", []] } },
                          ],
                        },
                      },
                    },
                  },
                  in: {
                    $map: {
                      input: {
                        $cond: [
                          { $gt: ["$$rootTopicCount", 0] },
                          "$$rootLanguages",
                          "$$contentLanguages",
                        ],
                      },
                      as: "language",
                      in: {
                        id: "$$language.id",
                        name: "$$language.name",
                        color: "$$language.color",
                      },
                    },
                  },
                },
              },
            },
          },
          [],
        ],
      },
    },
  },
  { $sort: { order: 1, _id: 1 } },
];

export const clearCourseListCache = () => {
  courseListCache = null;
};

export const getAllCourses = async (): Promise<any[]> => {
  const now = Date.now();

  if (courseListCache && courseListCache.expiresAt > now) {
    return courseListCache.data;
  }

  if (courseListPromise) return courseListPromise;

  const promise: Promise<any[]> = Course.aggregate(COURSE_SUMMARY_PIPELINE)
    .then((courses: any[]) => courses.map((course: any) => ({
      _id: course._id,
      title: course.title,
      slug: course.slug,
      category: course.category,
      type: course.type,
      description: course.description,
      level: course.level,
      topicsCount: Number(course.topicsCount) || 0,
      languages:
        course.type === "multi-language"
          ? (course.languages ?? []).map((language: any) => ({
              id: language.id,
              name: language.name,
              color: language.color,
            }))
          : undefined,
      isPublished: course.isPublished,
      isTopLevel: course.isTopLevel !== false,
      order: course.order,
    })))
    .then((courses) => {
      courseListCache = {
        data: courses,
        expiresAt: Date.now() + COURSE_LIST_CACHE_TTL,
      };
      return courses;
    })
    .finally(() => {
      if (courseListPromise === promise) {
        courseListPromise = null;
      }
    });

  courseListPromise = promise;
  return promise;
};

export const getSearchCourses = async (): Promise<ICourse[]> => {
  const courses = await Course.find({ isPublished: true, isTopLevel: { $ne: false } })
    .sort({ order: 1, createdAt: -1 })
    .lean();
  return courses.map(normalizeCourseForClient) as ICourse[];
};

export const getCourseBySlug = async (slug: string): Promise<ICourse | null> => {
  const course = await Course.findOne({ slug, isPublished: true }).lean();
  return normalizeCourseForClient(course) as ICourse | null;
};

export const createCourse = async (courseData: Partial<ICourse>): Promise<ICourse> => {
  const course = await Course.create(courseData);
  clearCourseListCache();
  return course;
};

export const updateCourse = async (
  id: string,
  courseData: Partial<ICourse>
): Promise<ICourse | null> => {
  const course = await Course.findByIdAndUpdate(
    id,
    courseData,
    { returnDocument: "after", runValidators: true }
  ).lean();
  clearCourseListCache();
  return course as ICourse | null;
};

export const deleteCourse = async (id: string): Promise<ICourse | null> => {
  const course = await Course.findByIdAndDelete(id).lean();
  clearCourseListCache();
  return course as ICourse | null;
};

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
  const course = await Course.findOne({ type: "problem-solving", isPublished: true }).sort({ order: 1, createdAt: 1 }).lean();
  if (!course) return null;
  const content = getCourseContent(course);
  const rawCategories = Array.isArray(content.categories) && content.categories.length > 0
    ? content.categories
    : Array.isArray(content.problemSolvingCategories) && content.problemSolvingCategories.length > 0
      ? content.problemSolvingCategories
      : Array.isArray((course as any).problemSolvingCategories)
        ? (course as any).problemSolvingCategories
        : [];
  const categories = rawCategories.map(toProblemCategoryPreview);
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
  const course = await Course.findOne({ type: "problem-solving", isPublished: true }).sort({ order: 1, createdAt: 1 }).lean();
  if (!course) return null;
  const categories = Array.isArray((course.content as any)?.categories) ? (course.content as any).categories : [];
  const category = categories.find((item: any) => item.slug === categorySlug);
  return category ? toProblemCategoryPreview(category) : null;
};

export const getProblemSolvingCourse = async (): Promise<ICourse | null> => {
  const course = await Course.findOne({ type: "problem-solving", isPublished: true }).sort({ order: 1, createdAt: 1 }).lean();
  return normalizeCourseForClient(course) as ICourse | null;
};

export const getProblemCategory = async (categorySlug: string) => {
  const course = await Course.findOne({ type: "problem-solving", isPublished: true }).sort({ order: 1, createdAt: 1 }).lean();
  if (!course) return null;
  const content = course.content as { categories?: Array<{ slug: string; [key: string]: unknown }> };
  return content.categories?.find((item) => item.slug === categorySlug) ?? null;
};

export const getProblemBySlug = async (categorySlug: string, problemSlug: string) => {
  const course = await Course.findOne({ type: "problem-solving", isPublished: true }).sort({ order: 1, createdAt: 1 }).lean();
  if (!course) return null;
  const content = course.content as { categories?: Array<{ slug: string; problems?: Array<{ slug: string; [key: string]: unknown }> }> };
  const category = content.categories?.find((item) => item.slug === categorySlug);
  if (!category) return null;
  return category.problems?.find((item) => item.slug === problemSlug) ?? null;
};
