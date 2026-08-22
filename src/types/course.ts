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

export type SingleLanguageCourse = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  level: string;
  topicsCount: number;

  topics: Topic[];

  languages?: never;
};

export type MultiLanguageCourse = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  level: string;
  topicsCount: number;

  languages: CourseLanguage[];

  topics?: never;
};

export type Course =
  | SingleLanguageCourse
  | MultiLanguageCourse;