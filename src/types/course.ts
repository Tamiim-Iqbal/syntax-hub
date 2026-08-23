export type HighlightPart = {
  type: "highlight";
  text: string;
};

export type BoldPart = {
  type: "bold";
  text: string;
};

export type InlineCodePart = {
  type: "inline-code";
  text: string;
};

export type RichTextContent =
  | string
  | Array<
    string |
    HighlightPart |
    BoldPart |
    InlineCodePart
  >;

export type LocalizedText =
  | string
  | {
    bn: RichTextContent;
    en: RichTextContent;
  };

export type ContentSection =
  | {
    type: "explanation";
    content: LocalizedText;
  }
  | {
    type: "only-text";
    content: LocalizedText;
  }
  | {
    type: "bullet-points";
    items: LocalizedText[];
  }
  | {
    type: "code";
    code: string;
    language: string;
  }
  | {
    type: "image";
    src: string;
    alt: string;
    caption?: LocalizedText;
  };

export type Subtopic = {
  _id: string;
  title: LocalizedText;
  slug: string;
  order: number;
  content?: LocalizedText;
  code?: string;
  language: string;
  sections?: ContentSection[];
};

export type Topic = {
  _id: string;
  title: LocalizedText;
  slug: string;
  order: number;
  content?: LocalizedText;
  code?: string;
  language: string;
  sections?: ContentSection[];
  subtopics?: Subtopic[];
};

export type CourseLanguage = {
  id: string;
  name: string;
  color: string;
  topics: Topic[];
};

/* =========================================
   Problem Solving Types
   ========================================= */

export type ProblemDifficulty =
  | "easy"
  | "medium"
  | "hard";

export type Problem = {
  _id: string;

  title: LocalizedText;

  slug: string;

  order: number;

  difficulty?: ProblemDifficulty;

  rating?: number;

  judge: string;

  judgeUrl?: string;

  problemNumber: string;

  topics: string[];

  problem?: {
    title: LocalizedText;

    description: LocalizedText;

    examples?: Array<{
      input: string;
      output: string;
      explanation?: LocalizedText;
    }>;

    constraints?: LocalizedText[];
  };

  approach?: {
    title: LocalizedText;

    sections: ContentSection[];
  };

  solutions?: Array<{
    language: string;

    label: string;

    code: string;
  }>;
};

export type ProblemCategory = {
  _id: string;

  title: LocalizedText;

  slug: string;

  description: LocalizedText;

  order: number;

  problems: Problem[];
};

/* =========================================
   Course Types
   ========================================= */

export type SingleLanguageCourse = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  type: "single-language";
  description: string;
  level: string;
  topicsCount: number;
  topics: Topic[];
  languages?: never;
  problemSolvingCategories?: never;
};

export type MultiLanguageCourse = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  type: "multi-language";
  description: string;
  level: string;
  topicsCount: number;
  languages: CourseLanguage[];
  topics?: never;
  problemSolvingCategories?: never;
};

export type ProblemSolvingCourse = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  type: "problem-solving";
  description: string;
  level: string;
  topicsCount: number;

  problemSolvingCategories: ProblemCategory[];

  topics?: never;
  languages?: never;
};

export type Course =
  | SingleLanguageCourse
  | MultiLanguageCourse
  | ProblemSolvingCourse;