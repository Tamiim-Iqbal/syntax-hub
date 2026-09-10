import type { Course, LocalizedText, Problem, ProblemCategory, Topic } from "../types/course";
import { getSearchCourses } from "./courseService";

export type SearchResultType = "course" | "topic" | "subtopic" | "category" | "problem";

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  courseTitle: string;
  courseSlug: string;
  categoryTitle?: string;
  topicTitle?: string;
  href: string;
  keywords: string[];
};

const textOf = (value: LocalizedText | string | undefined): string => {
  if (value === undefined) return "";
  if (typeof value === "string") return value;
  const values = [value.bn, value.en];
  return values
    .flatMap((item) => typeof item === "string" ? [item] : item)
    .map((item) => typeof item === "string" ? item : item.text)
    .join(" ");
};

const normalize = (value: string) => value.toLocaleLowerCase().trim();

const topicResults = (
  course: Extract<Course, { type: "single-language" } | { type: "multi-language" }>,
  topics: Topic[],
  languageLabel?: string,
): SearchResult[] => {
  const results: SearchResult[] = [];
  topics.forEach((topic) => {
    const topicTitle = textOf(topic.title);
    const description = textOf(topic.content);
    results.push({
      id: `${course._id}-${languageLabel ?? "course"}-${topic._id}`,
      type: "topic",
      title: topicTitle || topic.slug,
      description,
      courseTitle: course.title,
      courseSlug: course.slug,
      href: `/courses/${course.slug}?topic=${encodeURIComponent(topic.slug)}${languageLabel ? `&language=${encodeURIComponent(languageLabel)}` : ""}`,
      keywords: [topicTitle, topic.slug, description, course.title, course.category, languageLabel ?? ""],
    });

    (topic.subtopics ?? []).forEach((subtopic) => {
      const subtopicTitle = textOf(subtopic.title);
      results.push({
        id: `${course._id}-${languageLabel ?? "course"}-${subtopic._id}`,
        type: "subtopic",
        title: subtopicTitle || subtopic.slug,
        description: textOf(subtopic.content),
        courseTitle: course.title,
        courseSlug: course.slug,
        topicTitle,
        href: `/courses/${course.slug}?topic=${encodeURIComponent(topic.slug)}&subtopic=${encodeURIComponent(subtopic.slug)}${languageLabel ? `&language=${encodeURIComponent(languageLabel)}` : ""}`,
        keywords: [subtopicTitle, subtopic.slug, topicTitle, course.title, course.category, languageLabel ?? ""],
      });
    });
  });
  return results;
};

const buildIndex = (courses: Course[]): SearchResult[] => {
  const results: SearchResult[] = [];

  courses.forEach((course) => {
    results.push({
      id: course._id,
      type: "course",
      title: course.title,
      description: course.description,
      courseTitle: course.title,
      courseSlug: course.slug,
      href: `/courses/${course.slug}`,
      keywords: [course.title, course.slug, course.category, course.description, course.level],
    });

    if (course.type === "single-language") {
      results.push(...topicResults(course, course.topics));
      return;
    }

    if (course.type === "multi-language") {
      course.languages.forEach((lang) => results.push(...topicResults(course, lang.topics, lang.name)));
      return;
    }

    course.problemSolvingCategories.forEach((category: ProblemCategory) => {
      const categoryTitle = textOf(category.title) || category.slug;
      results.push({
        id: `${course._id}-${category._id}`,
        type: "category",
        title: categoryTitle,
        description: textOf(category.description),
        courseTitle: course.title,
        courseSlug: course.slug,
        href: `/courses/problem-solving/${category.slug}`,
        keywords: [categoryTitle, category.slug, textOf(category.description), course.title, course.category],
      });

      category.problems.forEach((problem: Problem) => {
        const title = textOf(problem.title) || problem.slug;
        const description = textOf(problem.problem?.description);
        results.push({
          id: `${course._id}-${category._id}-${problem._id}`,
          type: "problem",
          title,
          description,
          courseTitle: course.title,
          courseSlug: course.slug,
          categoryTitle,
          href: `/courses/problem-solving/${category.slug}/${problem.slug}`,
          keywords: [title, problem.slug, description, problem.judge, problem.problemNumber, ...problem.topics, categoryTitle, course.title],
        });
      });
    });
  });

  return results;
};

let cachedIndex: SearchResult[] | null = null;
let cachedAt = 0;

export const getSearchIndex = async (): Promise<SearchResult[]> => {
  if (cachedIndex && Date.now() - cachedAt < 5 * 60 * 1000) return cachedIndex;
  const courses = await getSearchCourses();
  cachedIndex = buildIndex(courses);
  cachedAt = Date.now();
  return cachedIndex;
};

export const searchContent = async (query: string): Promise<SearchResult[]> => {
  const term = normalize(query);
  if (!term) return [];
  const index = await getSearchIndex();
  return index
    .map((result) => {
      const haystack = normalize(result.keywords.join(" "));
      const title = normalize(result.title);
      let score = 0;
      if (title === term) score += 100;
      if (title.startsWith(term)) score += 60;
      if (title.includes(term)) score += 35;
      if (haystack.includes(term)) score += 10;
      return { result, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.result.title.localeCompare(b.result.title))
    .map((item) => item.result);
};

export const clearSearchCache = () => {
  cachedIndex = null;
  cachedAt = 0;
};
