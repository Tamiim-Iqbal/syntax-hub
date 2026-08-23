import { Link } from "react-router-dom";
import "./CourseCard.css";

type CourseLanguage = {
  id: string;
  name: string;
  color: string;
};

type CourseCardProps = {
  title: string;
  description: string;
  level: string;
  topics: number;
  category: string;
  slug: string;

  type:
  | "single-language"
  | "multi-language"
  | "problem-solving";

  languages?: CourseLanguage[];
};

function CourseCard({
  title,
  description,
  level,
  topics,
  category,
  slug,
  type,
  languages,
}: CourseCardProps) {

  const countLabel =
    type === "problem-solving"
      ? topics === 1
        ? "Problem"
        : "Problems"
      : topics === 1
        ? "Topic"
        : "Topics";
        

  return (
    <article className="course-card">
      <div className="course-card-top">
        <span className="course-card-category">
          {category}
        </span>

        <span className="course-card-level">
          {level}
        </span>
      </div>

      <div className="course-card-content">
        <h3>{title}</h3>

        <p>{description}</p>
      </div>

      <div className="course-card-footer">
  <div className="course-card-footer-meta">
    <span className="course-card-topics">
      {topics} {countLabel}
    </span>

    {languages && languages.length > 0 && (
      <div className="course-card-languages">
        {languages.map((language) => (
          <span
            key={language.id}
            className="course-card-language"
            style={{
              color: language.color,
              borderColor: language.color,
              backgroundColor: `${language.color}12`,
            }}
          >
            {language.name}
          </span>
        ))}
      </div>
    )}
  </div>

  <Link
    to={`/courses/${slug}`}
    className="course-card-button"
  >
    View Course →
  </Link>
</div>
    </article>
  );
}

export default CourseCard;