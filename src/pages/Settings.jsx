import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Save, Check } from "lucide-react";

const SETTINGS_DOC = doc(db, "settings", "config");

export default function Settings() {
  const [cutoffTime, setCutoffTime] = useState("08:30");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

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

  return (
    <div className="max-w-md">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-ink-dim mt-1">
          Controls used by the n8n attendance workflows.
        </p>
      </header>

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
