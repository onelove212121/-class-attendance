import { useEffect, useState } from "react";
import { Users2, Radio } from "lucide-react";
import { subscribeStudents } from "../lib/students";
import { formatTime } from "../lib/attendance";
import EmptyState from "../components/EmptyState";

export default function LiveStatus() {
  const [students, setStudents] = useState(null);

  useEffect(() => {
    const unsub = subscribeStudents(setStudents, () => setStudents([]));
    return unsub;
  }, []);

  const loading = students === null;
  const inRoom = (students || []).filter((s) => s.currentStatus === "IN");
  const outOfRoom = (students || []).filter((s) => s.currentStatus !== "IN");

  return (
    <div className="max-w-5xl">
      <header className="mb-7">
        <h1 className="font-display text-2xl font-semibold">Live Status</h1>
        <p className="text-sm text-ink-dim mt-1">
          Updates instantly as students tap in and out at the door.
        </p>
      </header>

      {!loading && students.length > 0 && (
        <div className="flex items-center gap-3 mb-7 px-5 py-4 rounded-xl bg-board text-chalk w-fit">
          <Radio size={20} className="text-accent" />
          <p className="text-lg">
            <span className="font-display font-semibold text-2xl">{inRoom.length}</span>
            <span className="text-chalk-dim text-sm"> / {students.length} students in the classroom right now</span>
          </p>
        </div>
      )}

      {loading && <p className="text-sm text-ink-dim">Loading…</p>}

      {!loading && students.length === 0 && (
        <EmptyState
          icon={Users2}
          title="No students added yet"
          hint="Add your first student from the Students page, then this board will fill up as cards get tapped at the door."
        />
      )}

      {!loading && students.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...inRoom, ...outOfRoom].map((s) => (
            <div
              key={s.id}
              className={`rounded-xl border px-4 py-3.5 ${
                s.currentStatus === "IN"
                  ? "border-present/30 bg-present-bg/50"
                  : "border-rule bg-white"
              }`}
            >
              <p className="font-medium text-sm truncate">{s.name}</p>
              <p className="text-xs text-ink-dim truncate mb-2">{s.section || "—"}</p>
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-mono uppercase ${
                    s.currentStatus === "IN" ? "text-present" : "text-ink-dim"
                  }`}
                >
                  {s.currentStatus === "IN" ? "In room" : "Out"}
                </span>
                <span className="text-xs text-ink-dim font-mono">
                  {formatTime(s.lastTapTime)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
