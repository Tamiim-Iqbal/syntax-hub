export const validateCreateCourse = (
  body: Record<string, unknown>
) => {
  const errors: string[] = [];

  if (
    typeof body.title !== "string" ||
    !body.title.trim()
  ) {
    errors.push("Title is required");
  }

  if (
    typeof body.slug !== "string" ||
    !body.slug.trim()
  ) {
    errors.push("Slug is required");
  }

  if (
    typeof body.category !== "string" ||
    !body.category.trim()
  ) {
    errors.push("Category is required");
  }

  if (
    typeof body.description !== "string" ||
    !body.description.trim()
  ) {
    errors.push("Description is required");
  }

  if (
    typeof body.level !== "string" ||
    !body.level.trim()
  ) {
    errors.push("Level is required");
  }

  if (
    body.content === undefined ||
    body.content === null
  ) {
    errors.push("Content is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateUpdateCourse = (
  body: Record<string, unknown>
) => {
  const errors: string[] = [];

  if (
    body.title !== undefined &&
    (typeof body.title !== "string" ||
      !body.title.trim())
  ) {
    errors.push("Title must be a non-empty string");
  }

  if (
    body.slug !== undefined &&
    (typeof body.slug !== "string" ||
      !body.slug.trim())
  ) {
    errors.push("Slug must be a non-empty string");
  }

  if (
    body.category !== undefined &&
    (typeof body.category !== "string" ||
      !body.category.trim())
  ) {
    errors.push(
      "Category must be a non-empty string"
    );
  }

  if (
    body.description !== undefined &&
    (typeof body.description !== "string" ||
      !body.description.trim())
  ) {
    errors.push(
      "Description must be a non-empty string"
    );
  }

  if (
    body.level !== undefined &&
    (typeof body.level !== "string" ||
      !body.level.trim())
  ) {
    errors.push("Level must be a non-empty string");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};