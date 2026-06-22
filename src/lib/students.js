import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const studentsRef = collection(db, "students");

/** Live-subscribes to all students, ordered by name. Returns an unsubscribe fn. */
export function subscribeStudents(onChange, onError) {
  const q = query(studentsRef, orderBy("name"));
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

export async function addStudent({ name, section, rfidUid }) {
  return addDoc(studentsRef, {
    name,
    section,
    rfidUid: rfidUid || null,
    currentStatus: "OUT",
    lastTapTime: null,
    parentChannel: null, // "telegram" | "messenger" | null
    parentChatId: null,
    createdAt: serverTimestamp(),
  });
}

export async function updateStudent(id, data) {
  return updateDoc(doc(db, "students", id), data);
}

export async function deleteStudent(id) {
  return deleteDoc(doc(db, "students", id));
}

/** Live-subscribes to every student whose RFID card is unregistered — unused for now, kept for the enrollment flow. */
export function subscribeUnlinkedStudents(onChange) {
  const q = query(studentsRef, where("rfidUid", "==", null));
  return onSnapshot(q, (snap) =>
    onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
}
