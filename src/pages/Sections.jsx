import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layers, Users2, ChevronRight } from "lucide-react";
import { subscribeStudents } from "../lib/students";
import EmptyState from "../components/EmptyState";

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
}

export default function Sections() {
  const [students, setStudents] = useState(null);

  useEffect(() => {
    const unsub = subscribeStudents(setStudents, () => setStudents([]));
    return unsub;
  }, []);

  const sections = useMemo(() => {
    if (!students) return null;
    const map = {};
    for (const s of students) {
      const key = s.section?.trim() || "Unassigned";
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    const keys = Object.keys(map).sort((a, b) => {
      if (a === "Unassigned") return 1;
      if (b === "Unassigned") return -1;
      return a.localeCompare(b);
    });
    return keys.map((name) => ({ name, count: map[name].length }));
  }, [students]);

  const loading = students === null;

  return (
    <div className="max-w-5xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Sections</h1>
        <p className="text-sm text-ink-dim mt-1">
          Students grouped by grade and section.
        </p>
      </header>

      {loading && <p className="text-sm text-ink-dim">Loading…</p>}

      {!loading && students.length === 0 && (
        <EmptyState
          icon={Users2}
          title="No students yet"
          hint="Add students from the Students page first, then they'll appear grouped by section here."
        />
      )}

      {!loading && students.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map(({ name, count }) => (
            <Link
              key={name}
              to={`/sections/${slugify(name)}`}
              className="rounded-xl border border-rule bg-white p-5 hover:border-ink-dim transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-board p-2.5 text-chalk">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-semibold">{name}</h2>
                    <p className="text-xs text-ink-dim mt-0.5">
                      {count} student{count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-ink-dim/40 group-hover:text-ink-dim transition-colors mt-1"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
