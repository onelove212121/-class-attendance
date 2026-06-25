import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "./firebase";

const attendanceRef = collection(db, "attendance");

/** Live-subscribes to every attendance record for one calendar date (YYYY-MM-DD). */
export function subscribeAttendanceForDate(dateStr, onChange, onError) {
  const q = query(attendanceRef, where("date", "==", dateStr));
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      console.error("[subscribeAttendanceForDate] Firestore error:", err.code, err.message);
      onError?.(err);
    }
  );
}

/** Live-subscribes to every absence record for one student, most recent first. */
export function subscribeAbsencesForStudent(studentId, onChange) {
  const q = query(
    attendanceRef,
    where("studentId", "==", studentId),
    where("status", "==", "absent")
  );
  return onSnapshot(
    q,
    (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first
      onChange(docs);
    },
    (err) => console.error("[subscribeAbsencesForStudent] Firestore error:", err.code, err.message)
  );
}

export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function formatDateDisplay(dateStr) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(ts) {
  if (!ts) return "—";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
}
