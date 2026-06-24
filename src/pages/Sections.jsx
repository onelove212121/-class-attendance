import { useEffect, useState, useMemo } from "react";
import { Layers, Users2, Nfc } from "lucide-react";
import { subscribeStudents } from "../lib/students";
import { formatTime } from "../lib/attendance";
import EmptyState from "../components/EmptyState";

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
    return keys.map((name) => ({ name, students: map[name] }));
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
        <div className="space-y-6">
          {sections.map(({ name, students: secStudents }) => (
            <div key={name} className="rounded-xl border border-rule bg-white overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 bg-paper border-b border-rule">
                <Layers size={16} className="text-ink-dim" />
                <h2 className="font-display text-base font-semibold">{name}</h2>
                <span className="ml-auto text-xs text-ink-dim font-mono">
                  {secStudents.length} student{secStudents.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="divide-y divide-rule">
                {secStudents.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-ink-dim shrink-0">
                      {s.rfidUid ? (
                        <span className="inline-flex items-center gap-1">
                          <Nfc size={12} /> Registered
                        </span>
                      ) : (
                        <span className="text-pending">No card</span>
                      )}
                      <span
                        className={`font-mono uppercase ${
                          s.currentStatus === "IN" ? "text-present" : "text-ink-dim"
                        }`}
                      >
                        {s.currentStatus === "IN" ? "In" : "Out"}
                      </span>
                      {s.lastTapTime && (
                        <span className="font-mono">{formatTime(s.lastTapTime)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
