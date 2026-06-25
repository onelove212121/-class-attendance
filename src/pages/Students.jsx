import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Users, UserPlus, ChevronRight } from "lucide-react";
import { subscribeStudents, addStudent, updateStudent } from "../lib/students";
import StudentFormModal from "../components/StudentFormModal";
import EmptyState from "../components/EmptyState";

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
}

export default function Students() {
  const [students, setStudents] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [lockedSection, setLockedSection] = useState(null);

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

  async function handleSave(data) {
    if (editing) {
      await updateStudent(editing.id, data);
    } else {
      await addStudent(data);
    }
    setModalOpen(false);
    setEditing(null);
    setLockedSection(null);
  }

  function openAddForSection(sectionName) {
    setEditing(null);
    setLockedSection(sectionName);
    setModalOpen(true);
  }

  function openNewSection() {
    const name = prompt("Enter a name for the new section:");
    if (name?.trim()) {
      setEditing(null);
      setLockedSection(name.trim());
      setModalOpen(true);
    }
  }

  const loading = students === null;

  return (
    <div className="max-w-5xl">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Students</h1>
          <p className="text-sm text-ink-dim mt-1">
            Manage the roster, register RFID cards, and link parent contacts.
          </p>
        </div>
        <button
          onClick={openNewSection}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-board text-chalk text-sm font-medium hover:bg-board-deep"
        >
          <Plus size={16} />
          New Section
        </button>
      </header>

      {loading && <p className="text-sm text-ink-dim">Loading…</p>}

      {!loading && students.length === 0 && (
        <EmptyState
          icon={UserPlus}
          title="No students yet"
          hint="Add your first student to create a section group."
          action={
            <button
              onClick={() => {
                setEditing(null);
                setLockedSection(null);
                setModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-board text-chalk text-sm font-medium hover:bg-board-deep"
            >
              Add your first student
            </button>
          }
        />
      )}

      {!loading && students.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map(({ name, count }) => (
            <div
              key={name}
              className="rounded-xl border border-rule bg-white overflow-hidden"
            >
              <Link
                to={`/students/${slugify(name)}`}
                className="flex items-center gap-3 p-5 hover:bg-paper/50 transition-colors group"
              >
                <div className="rounded-lg bg-board p-2.5 text-chalk">
                  <Users size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-base font-semibold truncate">{name}</h2>
                  <p className="text-xs text-ink-dim mt-0.5">
                    {count} student{count !== 1 ? "s" : ""}
                  </p>
                </div>
                <ChevronRight
                  size={18}
                  className="text-ink-dim/40 group-hover:text-ink-dim transition-colors shrink-0"
                />
              </Link>
              <div className="border-t border-rule px-5 py-3">
                <button
                  onClick={() => openAddForSection(name)}
                  className="flex items-center gap-1.5 text-sm font-medium text-ink-dim hover:text-ink transition-colors"
                >
                  <Plus size={15} />
                  Add student
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <StudentFormModal
          initial={editing}
          lockedSection={lockedSection}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
            setLockedSection(null);
          }}
        />
      )}
    </div>
  );
}
