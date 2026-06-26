import { useEffect, useRef, useState } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { subscribeStudents } from "../lib/students";
import { Save, Check } from "lucide-react";

const SETTINGS_DOC = doc(db, "settings", "config");
const REGISTRATION_DOC = doc(db, "settings", "registration");

export default function Settings() {
  const [cutoffTime, setCutoffTime] = useState("08:30");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const [registrationActive, setRegistrationActive] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [lastTargetName, setLastTargetName] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const userToggled = useRef(false);

  useEffect(() => {
    const unsub = subscribeStudents((all) => {
      setStudents(all.filter((s) => !s.rfidUid));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(REGISTRATION_DOC, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      if (
        registrationActive &&
        selectedStudentId &&
        data.active === false &&
        !userToggled.current
      ) {
        setSuccessMessage(`✅ Card registered to ${lastTargetName}!`);
        setRegistrationActive(false);
        setSelectedStudentId("");
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    });
    return unsub;
  }, [registrationActive, selectedStudentId, lastTargetName]);

  useEffect(() => {
    getDoc(SETTINGS_DOC).then((snap) => {
      if (snap.exists() && snap.data().absenceCutoffTime) {
        setCutoffTime(snap.data().absenceCutoffTime);
      }
      setLoading(false);
    });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    await setDoc(SETTINGS_DOC, { absenceCutoffTime: cutoffTime }, { merge: true });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleToggle(active) {
    if (!active) userToggled.current = true;
    setRegistrationActive(active);
    if (!active) {
      await setDoc(REGISTRATION_DOC, {
        active: false,
        targetStudentId: null,
        targetStudentName: null,
      });
      setSelectedStudentId("");
    }
  }

  async function handleStudentSelect(e) {
    const id = e.target.value;
    setSelectedStudentId(id);
    if (id) {
      const student = students.find((s) => s.id === id);
      const name = student?.name || "";
      setLastTargetName(name);
      await setDoc(REGISTRATION_DOC, {
        active: true,
        targetStudentId: id,
        targetStudentName: name,
      });
    }
  }

  return (
    <div className="max-w-md">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-ink-dim mt-1">
          Controls used by the n8n attendance workflows.
        </p>
      </header>

      {successMessage && (
        <div className="mb-4 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          {successMessage}
        </div>
      )}

      <div className="rounded-xl border border-rule bg-white px-6 py-5 space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Registration Mode</label>
          <button
            type="button"
            role="switch"
            aria-checked={registrationActive}
            onClick={() => handleToggle(!registrationActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              registrationActive ? "bg-board" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                registrationActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {registrationActive && (
          <div className="space-y-3">
            <select
              value={selectedStudentId}
              onChange={handleStudentSelect}
              className="w-full px-3 py-2 rounded-lg border border-rule text-sm"
            >
              <option value="">Select a student...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.section}
                </option>
              ))}
            </select>

            {selectedStudentId && (
              <p className="text-sm text-ink-dim animate-pulse">
                Waiting for card tap...
              </p>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-ink-dim">Loading…</p>
      ) : (
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-rule bg-white px-6 py-5 space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-ink-dim mb-1.5">
              Daily absence cutoff time
            </label>
            <input
              type="time"
              value={cutoffTime}
              onChange={(e) => setCutoffTime(e.target.value)}
              className="px-3 py-2 rounded-lg border border-rule text-sm font-mono"
            />
            <p className="text-xs text-ink-dim mt-1.5">
              Any student who hasn't tapped in by this time gets automatically
              marked absent for the day.
            </p>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-board text-chalk text-sm font-medium hover:bg-board-deep"
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? "Saved" : "Save settings"}
          </button>
        </form>
      )}
    </div>
  );
}
