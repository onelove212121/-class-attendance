import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Layers, Users2, Nfc, CalendarDays } from "lucide-react";
import { subscribeStudents } from "../lib/students";
import { formatTime } from "../lib/attendance";
import EmptyState from "../components/EmptyState";

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
}

export default function SectionDetail() {
  const { sectionSlug } = useParams();
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
    return map;
  }, [students]);

  const loading = students === null;

  let match = null;
  if (sections) {
    for (const name of Object.keys(sections)) {
      if (slugify(name) === sectionSlug) {
        match = { name, students: sections[name] };
        break;
      }
    }
  }

  if (loading) return <p className="text-sm text-ink-dim">Loading…</p>;

  if (!match) {
    return (
      <div className="max-w-5xl">
        <Link
          to="/sections"
          className="inline-flex items-center gap-1.5 text-sm text-ink-dim hover:text-ink mb-6"
        >
          <ArrowLeft size={15} />
          Back to sections
        </Link>
        <EmptyState
          icon={Layers}
          title="Section not found"
          hint="This section doesn't exist yet. Add a student with this section name from the Students page."
        />
      </div>
    );
  }

  const { name: sectionName, students: secStudents } = match;

  return (
    <div className="max-w-5xl">
      <Link
        to="/sections"
        className="inline-flex items-center gap-1.5 text-sm text-ink-dim hover:text-ink mb-6"
      >
        <ArrowLeft size={15} />
        Back to sections
      </Link>

      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold">{sectionName}</h1>
        <p className="text-sm text-ink-dim mt-1">
          {secStudents.length} student{secStudents.length !== 1 ? "s" : ""}
        </p>
      </header>

      <Link
        to={`/attendance/${slugify(sectionName)}`}
        className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-board text-chalk text-sm font-medium hover:bg-board-deep"
      >
        <CalendarDays size={16} />
        View attendance for {sectionName}
      </Link>

      {secStudents.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="No students in this section"
          hint="Add students from the Students page."
        />
      ) : (
        <div className="rounded-xl border border-rule overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper text-left text-xs uppercase tracking-wide text-ink-dim border-b border-rule">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">RFID card</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Parent link</th>
              </tr>
            </thead>
            <tbody>
              {secStudents.map((s) => (
                <tr key={s.id} className="border-b border-rule last:border-0">
                  <td className="px-5 py-3 font-medium">{s.name}</td>
                  <td className="px-5 py-3 font-mono text-xs">
                    {s.rfidUid ? (
                      <span className="inline-flex items-center gap-1.5 text-ink-dim">
                        <Nfc size={13} /> Registered
                      </span>
                    ) : (
                      <span className="text-pending">No card</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`font-mono text-xs uppercase ${
                        s.currentStatus === "IN" ? "text-present" : "text-ink-dim"
                      }`}
                    >
                      {s.currentStatus === "IN" ? "In room" : "Out"}
                    </span>
                    {s.lastTapTime && (
                      <span className="ml-2 text-xs text-ink-dim font-mono">
                        {formatTime(s.lastTapTime)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-dim capitalize text-xs">
                    {s.parentChannel ? s.parentChannel : <span className="text-pending">Not linked</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
