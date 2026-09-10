import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchContent, type SearchResult, type SearchResultType } from "../services/searchService";
import { useLanguage } from "../context/useLanguage";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import "./Search.css";

const labels = {
  bn: { label: "SEARCH", title: "কি শিখতে চান?", placeholder: "Course, topic, problem search করুন...", all: "সব", course: "Course", topic: "Topic", subtopic: "Subtopic", category: "Category", problem: "Problem", results: "টি ফলাফল", searching: "Searching...", no: "কোনো ফলাফল পাওয়া যায়নি", retry: "আবার চেষ্টা করুন" },
  en: { label: "SEARCH", title: "What do you want to learn?", placeholder: "Search courses, topics, problems...", all: "All", course: "Course", topic: "Topic", subtopic: "Subtopic", category: "Category", problem: "Problem", results: "results", searching: "Searching...", no: "No results found", retry: "Try again" },
};

function Search() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const { language } = useLanguage();
  const copy = labels[language];
  const [input, setInput] = useState(query);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filter, setFilter] = useState<"all" | SearchResultType>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setInput(query), [query]);

  useEffect(() => {
    let cancelled = false;
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    searchContent(query)
      .then((data) => { if (!cancelled) setResults(data); })
      .catch((requestError) => {
        console.error("Search error:", requestError);
        if (!cancelled) setError("Failed to search content.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [query]);

  const filtered = useMemo(
    () => filter === "all" ? results : results.filter((result) => result.type === filter),
    [results, filter],
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = input.trim();
    if (next) setParams({ q: next });
    else setParams({});
  };

  const filterOptions: Array<{ value: "all" | SearchResultType; label: string }> = [
    { value: "all", label: copy.all },
    { value: "course", label: copy.course },
    { value: "topic", label: copy.topic },
    { value: "subtopic", label: copy.subtopic },
    { value: "category", label: copy.category },
    { value: "problem", label: copy.problem },
  ];

  const typeLabel = (type: SearchResultType) => ({ course: copy.course, topic: copy.topic, subtopic: copy.subtopic, category: copy.category, problem: copy.problem }[type]);

  return (
    <div className="search-page">
      <section className="search-hero">
        <p className="section-label">{copy.label}</p>
        <h1>{copy.title}</h1>
        <form className="search-form" onSubmit={submit} role="search">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={copy.placeholder} aria-label={copy.placeholder} autoFocus />
          <button type="submit">Search</button>
        </form>
      </section>

      {query && !loading && !error && (
        <div className="search-toolbar">
          <div className="search-filters">
            {filterOptions.map((option) => (
              <button key={option.value} type="button" className={filter === option.value ? "active" : ""} onClick={() => setFilter(option.value)}>{option.label}</button>
            ))}
          </div>
          <span className="search-count">{filtered.length} {copy.results}</span>
        </div>
      )}

      {loading && <div className="search-status">{copy.searching}</div>}
      {!loading && error && <ErrorState message={error} onRetry={() => setParams({ q: query })} />}
      {!loading && !error && query && filtered.length === 0 && <EmptyState title={copy.no} message="Try another course, topic, subtopic, category or problem name." />}

      {!loading && !error && filtered.length > 0 && (
        <section className="search-results" aria-label="Search results">
          {filtered.map((result) => (
            <Link key={result.id} to={result.href} className="search-result-card">
              <div className="search-result-top">
                <span className={`search-result-type search-result-type-${result.type}`}>{typeLabel(result.type)}</span>
                <span className="search-result-arrow">→</span>
              </div>
              <h2>{result.title}</h2>
              <p>{result.description || result.courseTitle}</p>
              <div className="search-result-meta">
                <span>{result.courseTitle}</span>
                {result.categoryTitle && <span>• {result.categoryTitle}</span>}
                {result.topicTitle && <span>• {result.topicTitle}</span>}
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

export default Search;
