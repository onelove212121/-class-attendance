import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Users2, ChevronRight, Check } from "lucide-react";
import { subscribeStudents } from "../lib/students";
import { subscribeAttendanceForDate, todayStr } from "../lib/attendance";
import EmptyState from "../components/EmptyState";

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
}

export default function Attendance() {
  const [students, setStudents] = useState(null);
  const [records, setRecords] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayStr());

  useEffect(() => {
    const unsub = subscribeStudents(setStudents, () => setStudents([]));
    return unsub;
  }, []);

  useEffect(() => {
    setRecords(null);
    const unsub = subscribeAttendanceForDate(selectedDate, setRecords, () => setRecords([]));
    return unsub;
  }, [selectedDate]);

  const sections = useMemo(() => {
    if (!students) return null;
    const bySection = {};
    for (const s of students) {
      const key = s.section?.trim() || "Unassigned";
      if (!bySection[key]) bySection[key] = [];
      bySection[key].push(s);
    }
    const byStudent = records ? new Map(records.map((r) => [r.studentId, r])) : new Map();
    return Object.keys(bySection)
      .sort((a, b) => {
        if (a === "Unassigned") return 1;
        if (b === "Unassigned") return -1;
        return a.localeCompare(b);
      })
      .map((name) => {
        const secStudents = bySection[name];
        const present = secStudents.filter((s) => byStudent.get(s.id)?.status === "present").length;
        return { name, count: secStudents.length, present };
      });
  }, [students, records]);

  const loading = students === null || records === null;

  return (
    <div className="max-w-5xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Attendance</h1>
          <p className="text-sm text-ink-dim mt-1">
            Daily record of who was present, absent, or not yet marked.
          </p>
        </div>

        <input
          type="date"
          value={selectedDate}
          max={todayStr()}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 rounded-lg border border-rule text-sm bg-white"
        />
      </header>

      {loading && <p className="text-sm text-ink-dim">Loading…</p>}

      {!loading && students.length === 0 && (
        <EmptyState
          icon={Users2}
          title="No students to show attendance for"
          hint="Add students from the Students page first."
        />
      )}

      {!loading && students.length > 0 && sections.length === 0 && (
        <EmptyState
          icon={CalendarDays}
          title="No sections found"
          hint="Students must have a section assigned to appear here."
        />
      )}

      {!loading && students.length > 0 && sections.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map(({ name, count, present }) => (
            <Link
              key={name}
              to={`/attendance/${slugify(name)}`}
              className="rounded-xl border border-rule bg-white p-5 hover:border-ink-dim transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-board p-2.5 text-chalk">
                    <CalendarDays size={18} />
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
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1 font-medium text-present">
                  <Check size={15} strokeWidth={3} />
                  {present} present
                </span>
                <span className="text-ink-dim">·</span>
                <span className="text-ink-dim">
                  {count - present} {count - present === 1 ? "absent" : "absent"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
