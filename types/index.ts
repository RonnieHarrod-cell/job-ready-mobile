export type ScenarioCategory = "frontend" | "backend" | "designer" | "custom";
export type Rank = "E" | "D" | "C" | "B" | "A" | "S" | "SS" | "SSS";

export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: ScenarioCategory;
  difficulty: "junior" | "mid" | "senior";
  hasCode: boolean;
  language?: string;
  starterCode?: string;
  systemPrompt: string;
  tags: string[];
  createdBy?: string;
  createdAt?: number;
  isPublic?: boolean;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface InterviewSession {
  id: string;
  scenarioId: string;
  userId: string;
  messages: Message[];
  startedAt: number;
  endedAt?: number;
  feedback?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
  sessionsCompleted: number;
  customScenarios: string[];
  role?: "user" | "developer";
  xp: number;
  rank: Rank;
  lastSessionDate?: string;
  cvText?: string;
}

export interface BugReport {
  id: string;
  title: string;
  description: string;
  url: string;
  status: "open" | "in-progress" | "resolved";
  createdBy: string;
  createdByEmail: string;
  createdAt: number;
}
