import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, UserPlus, Nfc } from "lucide-react";
import { subscribeStudents, addStudent, updateStudent, deleteStudent } from "../lib/students";
import StudentFormModal from "../components/StudentFormModal";
import EmptyState from "../components/EmptyState";

export default function Students() {
  const [students, setStudents] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const unsub = subscribeStudents(setStudents, () => setStudents([]));
    return unsub;
  }, []);

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

      {loading && <p className="text-sm text-ink-dim">Loading…</p>}

      {!loading && students.length === 0 && (
        <EmptyState
          icon={UserPlus}
          title="No students yet"
          hint="Add your first student, then tap a blank card on the reader to link it instantly."
          action={
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-board text-chalk text-sm font-medium hover:bg-board-deep"
            >
              Add your first student
            </button>
          }
        />
      )}

      {!loading && students.length > 0 && (
        <div className="rounded-xl border border-rule overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper text-left text-xs uppercase tracking-wide text-ink-dim border-b border-rule">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Section</th>
                <th className="px-5 py-3 font-medium">RFID card</th>
                <th className="px-5 py-3 font-medium">Parent link</th>
                <th className="px-5 py-3 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-rule last:border-0">
                  <td className="px-5 py-3 font-medium">{s.name}</td>
                  <td className="px-5 py-3 text-ink-dim">{s.section || "—"}</td>
                  <td className="px-5 py-3 font-mono text-xs">
                    {s.rfidUid ? (
                      <span className="inline-flex items-center gap-1.5 text-ink-dim">
                        <Nfc size={13} /> {s.rfidUid}
                      </span>
                    ) : (
                      <span className="text-pending">Not registered</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-dim capitalize">
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
