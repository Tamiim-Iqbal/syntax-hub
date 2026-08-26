type Tab = "problem" | "approach" | "solution";
type Props = { activeTab: Tab; onChange: (tab: Tab) => void };

function ProblemTabs({ activeTab, onChange }: Props) {
  return (
    <nav className="problem-tabs" aria-label="Problem sections">
      {(["problem", "approach", "solution"] as const).map((tab) => (
        <button
          type="button"
          key={tab}
          className={activeTab === tab ? "active" : ""}
          onClick={() => onChange(tab)}
          aria-pressed={activeTab === tab}
        >
          {tab[0].toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </nav>
  );
}

export type { Tab };
export default ProblemTabs;
