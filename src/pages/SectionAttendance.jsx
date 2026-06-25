import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { subscribeStudents } from "../lib/students";
import { subscribeAttendanceForDate, todayStr, formatTime } from "../lib/attendance";
import StatusBadge from "../components/StatusBadge";
import StudentProfileDrawer from "../components/StudentProfileDrawer";
import EmptyState from "../components/EmptyState";

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
}

export default function SectionAttendance() {
  const { sectionSlug } = useParams();
  const [students, setStudents] = useState(null);
  const [records, setRecords] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [absenteesOnly, setAbsenteesOnly] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);

  useEffect(() => {
    const unsub = subscribeStudents(setStudents, () => setStudents([]));
    return unsub;
  }, []);

  useEffect(() => {
    setRecords(null);
    const unsub = subscribeAttendanceForDate(selectedDate, setRecords, () => setRecords([]));
    return unsub;
  }, [selectedDate]);

  const sectionName = useMemo(() => {
    if (!students) return null;
    const names = new Set();
    for (const s of students) {
      const key = s.section?.trim() || "Unassigned";
      if (slugify(key) === sectionSlug) names.add(key);
    }
    return names.size === 1 ? [...names][0] : null;
  }, [students, sectionSlug]);

  const filteredStudents = useMemo(() => {
    if (!students || !sectionName) return null;
    return students.filter((s) => (s.section?.trim() || "Unassigned") === sectionName);
  }, [students, sectionName]);

  const isToday = selectedDate === todayStr();

  const rows = useMemo(() => {
    if (!filteredStudents || !records) return null;
    const byStudent = new Map(records.map((r) => [r.studentId, r]));
    return filteredStudents
      .map((s) => {
        const rec = byStudent.get(s.id);
        const status = rec ? rec.status : isToday ? "pending" : "no-record";
        return { student: s, record: rec, status };
      })
      .sort((a, b) => a.student.name.localeCompare(b.student.name));
  }, [filteredStudents, records, isToday]);

  const loading = students === null || filteredStudents === null;
  const visibleRows = rows ? (absenteesOnly ? rows.filter((r) => r.status === "absent") : rows) : [];
  const absentCount = rows ? rows.filter((r) => r.status === "absent").length : 0;

  if (!loading && !sectionName) {
    return (
      <div className="max-w-5xl">
        <Link
          to="/attendance"
          className="inline-flex items-center gap-1.5 text-sm text-ink-dim hover:text-ink mb-6"
        >
          <ArrowLeft size={15} />
          Back to attendance
        </Link>
        <EmptyState
          icon={ClipboardList}
          title="Section not found"
          hint="No students found in this section. Check the section name or add students from the Students page."
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <Link
        to="/attendance"
        className="inline-flex items-center gap-1.5 text-sm text-ink-dim hover:text-ink mb-6"
      >
        <ArrowLeft size={15} />
        Back to attendance
      </Link>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">{sectionName}</h1>
          <p className="text-sm text-ink-dim mt-1">
            Attendance record for this section.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            max={todayStr()}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-rule text-sm bg-white"
          />
          <label className="flex items-center gap-2 text-sm text-ink-dim select-none cursor-pointer">
            <input
              type="checkbox"
              checked={absenteesOnly}
              onChange={(e) => setAbsenteesOnly(e.target.checked)}
              className="accent-board"
            />
            Show absentees only
          </label>
        </div>
      </header>

      {!loading && sectionName && filteredStudents.length > 0 && (
        <p className="text-sm text-ink-dim mb-4">
          <span className="font-mono text-absent font-medium">{absentCount}</span> absent of{" "}
          <span className="font-mono font-medium">{filteredStudents.length}</span> students on this date
        </p>
      )}

      {loading && <p className="text-sm text-ink-dim">Loading…</p>}

      {!loading && filteredStudents.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="No students in this section"
          hint="Add students from the Students page first."
        />
      )}

      {!loading && filteredStudents.length > 0 && visibleRows.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="No absentees on this date"
          hint="Nice — everyone was accounted for."
        />
      )}

      {!loading && visibleRows.length > 0 && (
        <div className="rounded-xl border border-rule overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper text-left text-xs uppercase tracking-wide text-ink-dim border-b border-rule">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Time in</th>
                <th className="px-5 py-3 font-medium">Time out</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map(({ student, record, status }) => (
                <tr
                  key={student.id}
                  onClick={() => setActiveStudent(student)}
                  className="border-b border-rule last:border-0 hover:bg-paper/70 cursor-pointer"
                >
                  <td className="px-5 py-3 font-medium">{student.name}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={status} compact />
                  </td>
                  <td className="px-5 py-3 font-mono text-ink-dim">
                    {formatTime(record?.timeIn)}
                  </td>
                  <td className="px-5 py-3 font-mono text-ink-dim">
                    {formatTime(record?.timeOut)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <StudentProfileDrawer student={activeStudent} onClose={() => setActiveStudent(null)} />
    </div>
  );
}
