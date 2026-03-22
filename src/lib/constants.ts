import { DomainConfig, CEFRLevel, Badge } from "@/types";

// ============================================
// OpenRouter Configuration
// ============================================
export const OPENROUTER_CONFIG = {
  baseUrl: "https://openrouter.ai/api/v1",
  // Qwen 3.5 9B: $0.05/M input, $0.15/M output — fastest & cheapest
  model: "qwen/qwen3.5-9b",
  // Fallback models (slightly more expensive but very reliable)
  fallbackModels: [
    "mistral/mistral-small-4",
    "google/gemini-2.0-flash-001",
  ],
  maxTokens: 500,
  temperature: 0.8,
  streamEnabled: true,
};

// ============================================
// CEFR Levels & XP Thresholds
// ============================================
export const CEFR_LEVELS: { level: CEFRLevel; name: string; xpRequired: number; description: string }[] = [
  { level: "A1", name: "Beginner", xpRequired: 0, description: "Can understand and use familiar everyday expressions" },
  { level: "A2", name: "Elementary", xpRequired: 500, description: "Can communicate in simple and routine tasks" },
  { level: "B1", name: "Intermediate", xpRequired: 2000, description: "Can deal with most situations while travelling" },
  { level: "B2", name: "Upper Intermediate", xpRequired: 5000, description: "Can interact with a degree of fluency and spontaneity" },
  { level: "C1", name: "Advanced", xpRequired: 12000, description: "Can express ideas fluently and spontaneously" },
  { level: "C2", name: "Mastery", xpRequired: 25000, description: "Can understand virtually everything heard or read" },
];

// ============================================
// Domain Configurations
// ============================================
export const DOMAINS: DomainConfig[] = [
  {
    id: "finance",
    name: "Finance & Banking",
    nameFr: "Finance / Banque / Investissement",
    icon: "💰",
    color: "#00B894",
    scenarios: [
      { id: "fin-1", title: "Investor Pitch", description: "Present your startup to potential investors", cefr_min: "B1", domain: "finance", system_prompt: "", suggested_duration: 15 },
      { id: "fin-2", title: "Client Meeting", description: "Discuss quarterly results with a client", cefr_min: "B2", domain: "finance", system_prompt: "", suggested_duration: 20 },
      { id: "fin-3", title: "Market Analysis", description: "Explain market trends to your team", cefr_min: "A2", domain: "finance", system_prompt: "", suggested_duration: 10 },
    ],
  },
  {
    id: "tech",
    name: "Tech & IT",
    nameFr: "Informatique / Développement / Cybersécurité",
    icon: "💻",
    color: "#6C5CE7",
    scenarios: [
      { id: "tech-1", title: "Sprint Planning", description: "Lead a sprint planning meeting", cefr_min: "B1", domain: "tech", system_prompt: "", suggested_duration: 15 },
      { id: "tech-2", title: "Code Review", description: "Discuss code changes with a colleague", cefr_min: "B2", domain: "tech", system_prompt: "", suggested_duration: 10 },
      { id: "tech-3", title: "Tech Support", description: "Help a non-technical user with an issue", cefr_min: "A2", domain: "tech", system_prompt: "", suggested_duration: 10 },
    ],
  },
  {
    id: "accounting",
    name: "Accounting & Audit",
    nameFr: "Comptabilité / Audit",
    icon: "📊",
    color: "#FDCB6E",
    scenarios: [
      { id: "acc-1", title: "Audit Report", description: "Present audit findings to management", cefr_min: "B2", domain: "accounting", system_prompt: "", suggested_duration: 15 },
      { id: "acc-2", title: "Tax Consultation", description: "Explain tax implications to a client", cefr_min: "B1", domain: "accounting", system_prompt: "", suggested_duration: 15 },
    ],
  },
  {
    id: "mechanics",
    name: "Mechanics & Industry",
    nameFr: "Mécanique / Industrie / Maintenance",
    icon: "🔧",
    color: "#E17055",
    scenarios: [
      { id: "mech-1", title: "Technical Briefing", description: "Explain a maintenance procedure", cefr_min: "A2", domain: "mechanics", system_prompt: "", suggested_duration: 10 },
      { id: "mech-2", title: "Safety Meeting", description: "Lead a safety briefing for the team", cefr_min: "B1", domain: "mechanics", system_prompt: "", suggested_duration: 15 },
    ],
  },
  {
    id: "crafts",
    name: "Crafts & Construction",
    nameFr: "Artisanat / Bâtiment / Peinture",
    icon: "🏗️",
    color: "#E84393",
    scenarios: [
      { id: "craft-1", title: "Client Consultation", description: "Discuss a renovation project with a client", cefr_min: "A2", domain: "crafts", system_prompt: "", suggested_duration: 10 },
    ],
  },
  {
    id: "sports",
    name: "Sports & Fitness",
    nameFr: "Sport (football, tennis, fitness, etc.)",
    icon: "⚽",
    color: "#00CEC9",
    scenarios: [
      { id: "sport-1", title: "Press Conference", description: "Answer journalist questions after a game", cefr_min: "B1", domain: "sports", system_prompt: "", suggested_duration: 10 },
      { id: "sport-2", title: "Training Session", description: "Explain exercises to international athletes", cefr_min: "A2", domain: "sports", system_prompt: "", suggested_duration: 10 },
    ],
  },
  {
    id: "marketing",
    name: "Marketing & Sales",
    nameFr: "Marketing / Vente / E-commerce",
    icon: "📣",
    color: "#A29BFE",
    scenarios: [
      { id: "mkt-1", title: "Product Launch", description: "Present a new product to stakeholders", cefr_min: "B1", domain: "marketing", system_prompt: "", suggested_duration: 15 },
      { id: "mkt-2", title: "Sales Call", description: "Negotiate a deal with a potential client", cefr_min: "B2", domain: "marketing", system_prompt: "", suggested_duration: 15 },
    ],
  },
  {
    id: "general",
    name: "General English",
    nameFr: "Anglais général",
    icon: "🌍",
    color: "#55EFC4",
    scenarios: [
      { id: "gen-1", title: "Job Interview", description: "Practice for a job interview in English", cefr_min: "A2", domain: "general", system_prompt: "", suggested_duration: 15 },
      { id: "gen-2", title: "Networking Event", description: "Meet people and talk about your work", cefr_min: "A2", domain: "general", system_prompt: "", suggested_duration: 10 },
      { id: "gen-3", title: "Daily Conversation", description: "Talk about your day and hobbies", cefr_min: "A1", domain: "general", system_prompt: "", suggested_duration: 10 },
    ],
  },
];

// ============================================
// Badges
// ============================================
export const ALL_BADGES: Badge[] = [
  { id: "first-session", name: "First Steps", description: "Complete your first conversation", icon: "🎯", condition: "sessions >= 1", unlocked: false },
  { id: "streak-3", name: "On Fire", description: "3-day streak", icon: "🔥", condition: "streak >= 3", unlocked: false },
  { id: "streak-7", name: "Weekly Warrior", description: "7-day streak", icon: "⚡", condition: "streak >= 7", unlocked: false },
  { id: "streak-30", name: "Monthly Master", description: "30-day streak", icon: "👑", condition: "streak >= 30", unlocked: false },
  { id: "minutes-60", name: "Chatterbox", description: "60 minutes spoken", icon: "💬", condition: "minutes >= 60", unlocked: false },
  { id: "minutes-300", name: "Conversationalist", description: "5 hours spoken", icon: "🗣️", condition: "minutes >= 300", unlocked: false },
  { id: "xp-1000", name: "Rising Star", description: "Earn 1,000 XP", icon: "⭐", condition: "xp >= 1000", unlocked: false },
  { id: "xp-5000", name: "Knowledge Seeker", description: "Earn 5,000 XP", icon: "🏆", condition: "xp >= 5000", unlocked: false },
  { id: "level-b1", name: "B1 Achieved", description: "Reach CEFR level B1", icon: "🎓", condition: "level >= B1", unlocked: false },
  { id: "level-b2", name: "B2 Achieved", description: "Reach CEFR level B2", icon: "🎖️", condition: "level >= B2", unlocked: false },
  { id: "domains-3", name: "Polyvalent", description: "Practice in 3 different domains", icon: "🌐", condition: "domains >= 3", unlocked: false },
  { id: "perfect-score", name: "Perfectionist", description: "Score 95+ on a session", icon: "💎", condition: "score >= 95", unlocked: false },
];

// ============================================
// System Prompts
// ============================================
export const SYSTEM_PROMPTS = {
  conversation: (level: CEFRLevel, domain: string, scenario: string, userName: string) => `You are a friendly, natural English conversation partner for a language learner named ${userName}.

ROLE: You are a professional working in ${domain}. You're having a real conversation, not teaching a class.

CONVERSATION CONTEXT: ${scenario}

CEFR LEVEL: ${level}
- A1/A2: Use simple sentences, common vocabulary, speak slowly. Ask simple yes/no or short-answer questions.
- B1: Use moderately complex sentences. Introduce some domain-specific vocabulary naturally.
- B2: Speak naturally with professional vocabulary. Use idioms occasionally.
- C1/C2: Speak as you would with a native speaker. Use complex structures, nuance, humor.

RULES:
1. NEVER break character. You're a real person, not an AI tutor.
2. Keep responses concise (2-4 sentences max) to allow natural back-and-forth.
3. Ask follow-up questions to keep the conversation going.
4. If the user makes a small error, DON'T correct it mid-conversation. Continue naturally.
5. If the user seems stuck, offer a gentle prompt or rephrase your question more simply.
6. Use domain-specific vocabulary naturally in context.
7. Adapt your language complexity to match the user's level.
8. Be encouraging and natural — react with emotions, opinions, humor when appropriate.
9. NEVER use markdown formatting. Speak naturally as in a real conversation.
10. Respond ONLY in English.`,

  feedback: (messages: string, level: CEFRLevel) => `Analyze the following English conversation from a ${level}-level learner. The USER messages are from the learner.

CONVERSATION:
${messages}

Provide a JSON response with this exact structure:
{
  "scores": {
    "overall": <0-100>,
    "fluency": <0-100>,
    "grammar": <0-100>,
    "vocabulary": <0-100>,
    "pronunciation": <0-100>,
    "comprehension": <0-100>
  },
  "corrections": [
    {
      "original": "<what the user said>",
      "corrected": "<correct version>",
      "explanation": "<brief explanation in the user's native language if possible>",
      "category": "<grammar|vocabulary|pronunciation|fluency|register>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "tips": ["<tip 1>", "<tip 2>"],
  "cefr_estimate": "<A1|A2|B1|B2|C1|C2>",
  "xp_earned": <10-50 based on performance and effort>
}

Be encouraging but honest. Focus on patterns of errors, not every tiny mistake.`,

  levelTest: (userName: string) => `You are conducting a CEFR oral assessment for ${userName}. Your goal is to determine their English speaking level (A1 to C2).

ASSESSMENT FLOW:
1. Start with a warm greeting and ask them to introduce themselves briefly.
2. Ask about their work and daily routine (A1-A2 level check).
3. Ask them to describe an experience or tell a story (B1 check).
4. Ask for their opinion on a topic related to their field (B2 check).
5. Discuss a complex/abstract topic if they seem advanced (C1-C2 check).

RULES:
- Keep it conversational, NOT like a formal exam.
- Adapt difficulty based on their responses.
- If they struggle, simplify. If they're comfortable, increase complexity.
- Ask 4-5 questions total. Keep it under 5 minutes.
- Be warm and encouraging.
- Respond ONLY in English.
- Keep responses short (1-2 sentences + question).`,
};

// ============================================
// TTS Voice Configuration
// ============================================
export const TTS_VOICES = {
  us: { male: "en-US", female: "en-US" },
  uk: { male: "en-GB", female: "en-GB" },
  au: { male: "en-AU", female: "en-AU" },
};

// XP rewards
export const XP_REWARDS = {
  session_complete: 20,
  perfect_score: 30,
  streak_bonus: 5,
  first_session_of_day: 10,
  scenario_complete: 25,
  level_test: 15,
};
