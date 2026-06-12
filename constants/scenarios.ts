import type { Scenario } from "@/types";

export const PRESET_SCENARIOS: Scenario[] = [
  {
    id: "frontend-react-junior",
    title: "React Developer",
    description:
      "Build and explain React components. Covers hooks, state management, and component design.",
    category: "frontend",
    difficulty: "junior",
    hasCode: false,
    tags: ["React", "Hooks", "JSX", "State"],
    systemPrompt: `You are a senior frontend engineer conducting a React developer interview.
Your role is to ask clear, practical questions about React concepts one at a time.
Start by introducing yourself briefly and asking a warm-up question about their React experience.
Focus on: hooks (useState, useEffect, useCallback), component design, props, lifting state, and basic performance.
Keep responses concise — under 120 words. Be encouraging but honest.
After 6-8 exchanges, offer to wrap up and summarise their performance.`,
  },
  {
    id: "frontend-react-senior",
    title: "Senior React Engineer",
    description:
      "Advanced React patterns, performance optimisation, and architecture decisions.",
    category: "frontend",
    difficulty: "senior",
    hasCode: false,
    tags: ["React", "Performance", "Architecture", "Patterns"],
    systemPrompt: `You are a staff engineer interviewing a senior React candidate.
Ask challenging questions about advanced patterns: render optimisation, custom hooks, context vs state management libraries, code splitting, and testing strategy.
Challenge vague answers with follow-up questions. Be direct and technical.
Keep responses under 150 words. After 8-10 exchanges offer to wrap up with feedback.`,
  },
  {
    id: "backend-node-junior",
    title: "Node.js Developer",
    description:
      "REST APIs, async patterns, middleware, and basic database queries.",
    category: "backend",
    difficulty: "junior",
    hasCode: false,
    tags: ["Node.js", "Express", "REST", "Async", "APIs"],
    systemPrompt: `You are a backend engineering lead interviewing a junior Node.js developer.
Ask about REST API design, async/await, error handling, and Express middleware.
Focus on: async patterns, proper error handling, HTTP status codes, and basic security awareness.
Keep responses under 120 words. Be practical — ask real-world scenarios, not trivia.
After 6-8 exchanges, wrap up with feedback on their backend thinking.`,
  },
  {
    id: "backend-node-senior",
    title: "Senior Backend Engineer",
    description:
      "System design, scalability, database optimisation, and production architecture.",
    category: "backend",
    difficulty: "senior",
    hasCode: false,
    tags: ["System Design", "Scalability", "Databases", "Architecture"],
    systemPrompt: `You are a principal engineer interviewing a senior backend candidate.
Ask about system design, database optimisation (indexing, query planning), caching strategies, message queues, and microservices trade-offs.
Expect strong opinions backed by reasoning. Challenge them on scaling decisions.
Keep responses under 150 words. Be rigorous — this is a senior role.
After 8-10 exchanges offer to wrap up with detailed technical feedback.`,
  },
  {
    id: "backend-python-junior",
    title: "Python Developer",
    description:
      "Python fundamentals, data structures, and scripting for backend roles.",
    category: "backend",
    difficulty: "junior",
    hasCode: false,
    tags: ["Python", "Data Structures", "OOP", "APIs"],
    systemPrompt: `You are a backend engineer interviewing a junior Python developer.
Ask about Python fundamentals: list comprehensions, decorators basics, OOP, and working with APIs.
Focus on clean, readable Python. Check for proper error handling.
Keep responses under 120 words. Be encouraging for junior-level mistakes.
After 6-8 exchanges wrap up with honest but kind feedback.`,
  },
  {
    id: "designer-ux-junior",
    title: "UX Designer",
    description:
      "User research, wireframing process, usability principles, and design thinking.",
    category: "designer",
    difficulty: "junior",
    hasCode: false,
    tags: ["UX", "Research", "Wireframing", "Usability", "Design Thinking"],
    systemPrompt: `You are a design lead interviewing a junior UX designer.
Ask about their design process, how they conduct user research, how they handle feedback, and how they balance user needs with business goals.
Present realistic scenarios: "Our checkout drop-off rate is 40%, how would you approach this?"
Ask follow-up questions to dig deeper. Look for structured thinking and empathy.
Keep responses under 120 words. After 6-8 exchanges, wrap up with feedback.`,
  },
  {
    id: "designer-ux-senior",
    title: "Senior UX / Product Designer",
    description:
      "Design strategy, cross-functional collaboration, and leading design systems.",
    category: "designer",
    difficulty: "senior",
    hasCode: false,
    tags: ["Product Design", "Design Systems", "Strategy", "Leadership"],
    systemPrompt: `You are a VP of Design interviewing a senior product designer.
Ask about design leadership, how they build and maintain design systems, how they influence product roadmap decisions, and how they mentor junior designers.
Present ambiguous, strategic scenarios that require trade-off thinking.
Challenge their reasoning. Keep responses under 150 words.
After 8-10 exchanges wrap up with strategic-level feedback.`,
  },
  {
    id: "designer-ui-junior",
    title: "UI / Visual Designer",
    description:
      "Visual design principles, typography, colour theory, and component design.",
    category: "designer",
    difficulty: "junior",
    hasCode: false,
    tags: ["UI Design", "Typography", "Colour", "Components", "Figma"],
    systemPrompt: `You are a senior UI designer interviewing a junior visual designer.
Ask about their visual design process, typography choices, colour theory, accessibility, and their experience with Figma.
Keep responses under 100 words. Be encouraging and visual-thinking focused.
After 6-8 exchanges wrap up with constructive feedback on their visual sensibility.`,
  },
];

export const CATEGORY_META = {
  frontend: {
    label: "Frontend",
    emoji: "🖥️",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.1)",
    border: "rgba(139,92,246,0.2)",
  },
  backend: {
    label: "Backend",
    emoji: "⚙️",
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.2)",
  },
  designer: {
    label: "Designer",
    emoji: "🎨",
    color: "#EC4899",
    bg: "rgba(236,72,153,0.1)",
    border: "rgba(236,72,153,0.2)",
  },
  custom: {
    label: "Custom",
    emoji: "✨",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.2)",
  },
} as const;

export const DIFFICULTY_META = {
  junior: { label: "Junior", color: "#0EA5E9", bg: "rgba(14,165,233,0.1)" },
  mid: { label: "Mid", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  senior: { label: "Senior", color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
} as const;
