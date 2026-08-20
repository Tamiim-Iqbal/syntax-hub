import { Link } from "react-router-dom";

type CourseCardProps = {
    title: string;
    description: string;
    level: string;
    topics: number;
    category: string;
    slug: string;
};

function CourseCard({
    title,
    description,
    level,
    topics,
    category,
    slug,
}: CourseCardProps) {
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
                <span className="course-card-topics">
                    {topics} Topics
                </span>

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