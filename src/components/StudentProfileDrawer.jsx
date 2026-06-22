import { X, CalendarX } from "lucide-react";
import { useEffect, useState } from "react";
import { subscribeAbsencesForStudent, formatDateDisplay } from "../lib/attendance";
import TallyMarks from "./TallyMarks";

export default function StudentProfileDrawer({ student, onClose }) {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    setLoading(true);
    const unsub = subscribeAbsencesForStudent(student.id, (docs) => {
      setAbsences(docs);
      setLoading(false);
    });
    return unsub;
  }, [student]);

  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-rule">
          <div>
            <h2 className="font-display text-lg font-semibold">{student.name}</h2>
            <p className="text-xs text-ink-dim">{student.section || "No section set"}</p>
          </div>
          <button
            onClick={onClose}
            className="text-ink-dim hover:text-ink p-1 rounded-md"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 border-b border-rule bg-paper/60">
          <p className="text-xs font-medium text-ink-dim uppercase tracking-wide mb-2">
            Total absences this term
          </p>
          <div className="flex items-baseline gap-3">
            <span className="font-display text-4xl font-semibold text-absent">
              {loading ? "—" : absences.length}
            </span>
            <TallyMarks count={absences.length} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-xs font-medium text-ink-dim uppercase tracking-wide mb-3">
            Absence history
          </p>

          {loading && <p className="text-sm text-ink-dim">Loading…</p>}

          {!loading && absences.length === 0 && (
            <div className="flex flex-col items-center text-center py-10">
              <CalendarX size={28} className="text-ink-dim mb-3" strokeWidth={1.6} />
              <p className="text-sm text-ink-dim">No absences recorded yet.</p>
            </div>
          )}

          {!loading && absences.length > 0 && (
            <ul className="space-y-2">
              {absences.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-absent-bg/60 text-sm"
                >
                  <span className="font-medium text-ink">{formatDateDisplay(a.date)}</span>
                  <span className="text-absent text-xs font-mono uppercase">Absent</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
