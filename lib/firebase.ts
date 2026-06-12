import type { InterviewSession, Scenario, UserProfile } from "@/types";
import { getApps, initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

export { onAuthStateChanged };
export type { User };

// ─── User Profiles ────────────────────────────────────────────────────────────

export async function ensureUserProfile(user: User) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email ?? "",
      displayName: user.displayName ?? "Anon",
      createdAt: Date.now(),
      sessionsCompleted: 0,
      customScenarios: [],
      role: "user",
      xp: 0,
      rank: "E",
    };
    // Only add photoURL if it exists — Firestore rejects undefined
    if (user.photoURL) {
      profile.photoURL = user.photoURL;
    }
    await setDoc(ref, profile);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

// ─── Scenarios ────────────────────────────────────────────────────────────────

export async function getUserScenarios(uid: string): Promise<Scenario[]> {
  const q = query(
    collection(db, "scenarios"),
    where("createdBy", "==", uid),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Scenario);
}

export async function getPublicScenarios(): Promise<Scenario[]> {
  const q = query(
    collection(db, "scenarios"),
    where("isPublic", "==", true),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Scenario);
}

export async function createScenario(
  scenario: Omit<Scenario, "id">,
  uid: string,
): Promise<string> {
  const ref = await addDoc(collection(db, "scenarios"), {
    ...scenario,
    createdBy: uid,
    createdAt: Date.now(),
  });
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const existing: string[] = userSnap.data().customScenarios ?? [];
    await updateDoc(userRef, { customScenarios: [...existing, ref.id] });
  }
  return ref.id;
}

export async function deleteScenario(scenarioId: string, uid: string) {
  await deleteDoc(doc(db, "scenarios", scenarioId));
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const existing: string[] = userSnap.data().customScenarios ?? [];
    await updateDoc(userRef, {
      customScenarios: existing.filter((id) => id !== scenarioId),
    });
  }
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function saveSession(
  session: Omit<InterviewSession, "id">,
): Promise<string> {
  const ref = await addDoc(collection(db, "sessions"), {
    ...session,
    endedAt: Date.now(),
  });
  const profile = await getUserProfile(session.userId);
  if (profile) {
    await updateDoc(doc(db, "users", session.userId), {
      sessionsCompleted: profile.sessionsCompleted + 1,
    });
  }
  return ref.id;
}

export async function getUserSessions(
  uid: string,
): Promise<InterviewSession[]> {
  const q = query(
    collection(db, "sessions"),
    where("userId", "==", uid),
    orderBy("startedAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as InterviewSession);
}

// ─── CV ───────────────────────────────────────────────────────────────────────

export async function saveCV(uid: string, text: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { cvText: text });
}

export async function deleteCV(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { cvText: null });
}

// ─── Bug Reports ──────────────────────────────────────────────────────────────

export async function submitBugReport(
  report: Omit<import("@/types").BugReport, "id" | "status" | "createdAt">,
): Promise<string> {
  const ref = await addDoc(collection(db, "bugs"), {
    ...report,
    status: "open",
    createdAt: Date.now(),
  });
  return ref.id;
}
