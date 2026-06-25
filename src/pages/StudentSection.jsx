import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Users, Nfc } from "lucide-react";
import { subscribeStudents, addStudent, updateStudent, deleteStudent } from "../lib/students";
import StudentFormModal from "../components/StudentFormModal";
import EmptyState from "../components/EmptyState";

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
}

export default function StudentSection() {
  const { sectionSlug } = useParams();
  const [students, setStudents] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const unsub = subscribeStudents(setStudents, () => setStudents([]));
    return unsub;
  }, []);

  const sectionName = useMemo(() => {
    if (!students) return null;
    for (const s of students) {
      const key = s.section?.trim() || "Unassigned";
      if (slugify(key) === sectionSlug) return key;
    }
    return null;
  }, [students, sectionSlug]);

  const sectionStudents = useMemo(() => {
    if (!students || !sectionName) return null;
    return students.filter((s) => (s.section?.trim() || "Unassigned") === sectionName);
  }, [students, sectionName]);

  async function handleSave(data) {
    if (editing) {
      await updateStudent(editing.id, data);
    } else {
      await addStudent(data);
    }
    setModalOpen(false);
    setEditing(null);
  }

  async function handleDelete(student) {
    if (!confirm(`Remove ${student.name} from the roster?`)) return;
    await deleteStudent(student.id);
  }

  const loading = students === null;

  if (loading) return <p className="text-sm text-ink-dim">Loading…</p>;

  if (!sectionName) {
    return (
      <div className="max-w-5xl">
        <Link
          to="/students"
          className="inline-flex items-center gap-1.5 text-sm text-ink-dim hover:text-ink mb-6"
        >
          <ArrowLeft size={15} />
          Back to students
        </Link>
        <EmptyState
          icon={Users}
          title="Section not found"
          hint="This section doesn't exist yet. Add a student with this section name from the Students page."
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <Link
        to="/students"
        className="inline-flex items-center gap-1.5 text-sm text-ink-dim hover:text-ink mb-6"
      >
        <ArrowLeft size={15} />
        Back to students
      </Link>

      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">{sectionName}</h1>
          <p className="text-sm text-ink-dim mt-1">
            {sectionStudents.length} student{sectionStudents.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-board text-chalk text-sm font-medium hover:bg-board-deep"
        >
          <Plus size={16} />
          Add student
        </button>
      </header>

      {sectionStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students in this section"
          hint="Add your first student to this section."
          action={
            <button
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-board text-chalk text-sm font-medium hover:bg-board-deep"
            >
              Add student
            </button>
          }
        />
      ) : (
        <div className="rounded-xl border border-rule overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper text-left text-xs uppercase tracking-wide text-ink-dim border-b border-rule">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">RFID card</th>
                <th className="px-5 py-3 font-medium">Parent link</th>
                <th className="px-5 py-3 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody>
              {sectionStudents.map((s) => (
                <tr key={s.id} className="border-b border-rule last:border-0">
                  <td className="px-5 py-3 font-medium">{s.name}</td>
                  <td className="px-5 py-3 font-mono text-xs">
                    {s.rfidUid ? (
                      <span className="inline-flex items-center gap-1.5 text-ink-dim">
                        <Nfc size={13} /> {s.rfidUid}
                      </span>
                    ) : (
                      <span className="text-pending">Not registered</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-dim capitalize text-xs">
                    {s.parentChannel ? s.parentChannel : <span className="text-pending">Not linked</span>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => {
                          setEditing(s);
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-md text-ink-dim hover:text-ink hover:bg-paper"
                        aria-label={`Edit ${s.name}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        className="p-1.5 rounded-md text-ink-dim hover:text-absent hover:bg-absent-bg"
                        aria-label={`Remove ${s.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <StudentFormModal
          initial={editing}
          lockedSection={sectionName}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
