import { SUBJECT_KEYWORDS } from '../data/questions';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Models confirmed available — in order of preference
const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
  'gemini-pro-latest',
];

const SYSTEM_PROMPT = `You are EduBot, an expert AI tutor for students. You help with Math, Physics, Chemistry, Biology, Computer Science, English, History, and Geography.

Your response style:
- Always begin with: "Dear student,"
- Explain clearly with examples, analogies, and step-by-step reasoning
- Use markdown: **bold**, bullet points, numbered lists, \`code\` for formulas
- For math/science: include worked examples and equations
- Keep an encouraging, supportive tone
- Always end with: "I hope you understand. If you have more doubts, feel free to ask! 😊"`;

export function detectSubject(text) {
  const lower = text.toLowerCase();
  let bestMatch = null;
  let bestCount = 0;
  for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
    const count = keywords.filter(kw => lower.includes(kw)).length;
    if (count > bestCount) { bestCount = count; bestMatch = subject; }
  }
  return bestMatch || 'general';
}

async function callGeminiModel(model, key, conversationHistory, userMessage) {
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${key}`;

  const contents = [];
  const history = conversationHistory.slice(-10);
  for (const msg of history) {
    if (msg.role === 'user' || msg.role === 'bot') {
      contents.push({
        role: msg.role === 'bot' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }
  }
  const prompt = contents.length === 0
    ? `${SYSTEM_PROMPT}\n\nStudent asks: ${userMessage}`
    : userMessage;
  contents.push({ role: 'user', parts: [{ text: prompt }] });

  const body = {
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
  };
  if (model !== 'gemini-pro') {
    body.systemInstruction = { parts: [{ text: SYSTEM_PROMPT }] };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`${res.status}: ${data?.error?.message || 'Gemini error'}`);
  }
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

export async function sendMessage(conversationHistory, userMessage, _apiKey) {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const isValidKey = geminiKey.startsWith('AIza');

  if (isValidKey) {
    let lastError = null;
    for (const model of GEMINI_MODELS) {
      try {
        const result = await callGeminiModel(model, geminiKey, conversationHistory, userMessage);
        if (result) return result;
      } catch (err) {
        console.warn(`Gemini ${model} failed:`, err.message);
        lastError = err;
        if (err.message.startsWith('400') || err.message.startsWith('401') || err.message.startsWith('403')) break;
        continue;
      }
    }
    if (lastError) {
      const msg = lastError.message || '';
      if (msg.includes('quota') || msg.startsWith('429')) throw new Error('⚠️ Gemini rate limit hit. Please wait a moment and try again.');
      if (msg.startsWith('400') || msg.startsWith('401') || msg.startsWith('403')) throw new Error('⚠️ Invalid API key. Please check your VITE_GEMINI_API_KEY in the .env file.');
      throw new Error(`⚠️ Gemini error: ${msg}`);
    }
  }

  return getMockResponse(userMessage);
}

// ── Quiz Question Generator ────────────────────────────────────
// Calls Gemini to produce 5 MCQ questions for the given topic.
// Returns an array of { question, options[4], correct (0-3), explanation }
export async function generateQuizQuestions(topic, subject) {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!geminiKey.startsWith('AIza')) {
    return getDefaultQuestions(topic, subject);
  }

  const prompt = `Generate exactly 5 multiple choice questions about: "${topic}" for a student studying ${subject}.

Return ONLY a valid JSON array with no extra text:
[
  {
    "question": "Question text ending with ?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "One sentence explanation"
  }
]

Rules: correct = 0-based index of right answer. All 4 options must be distinct. Mix difficulty (3 easy, 2 hard).`;

  for (const model of GEMINI_MODELS) {
    try {
      const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 2000 },
        }),
      });
      const data = await res.json();
      if (!res.ok) continue;

      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const match = raw.match(/\[[\s\S]*\]/);
      if (!match) continue;

      const questions = JSON.parse(match[0]);
      if (Array.isArray(questions) && questions.length > 0) {
        const valid = questions.every(q =>
          q.question && Array.isArray(q.options) && q.options.length === 4 &&
          typeof q.correct === 'number' && q.correct >= 0 && q.correct <= 3
        );
        if (valid) return questions.slice(0, 5);
      }
    } catch (err) {
      console.warn(`Quiz gen ${model} failed:`, err.message);
    }
  }
  return getDefaultQuestions(topic, subject);
}

function getDefaultQuestions(topic, subject) {
  const t = topic.substring(0, 60);
  return [
    { question: `What is the main idea behind "${t}"?`, options: ['A fundamental principle', 'A recent discovery', 'An optional concept', 'A different subject'], correct: 0, explanation: `"${t}" is a fundamental principle in ${subject}.` },
    { question: `Which field does "${t}" primarily belong to?`, options: [subject, 'History', 'Literature', 'Commerce'], correct: 0, explanation: `"${t}" is a core topic in ${subject}.` },
    { question: `Why is understanding "${t}" important?`, options: ['It helps explain key phenomena', 'It has no practical use', 'It only applies in labs', 'It is an extra topic'], correct: 0, explanation: `Understanding "${t}" is essential for ${subject} mastery.` },
    { question: `A student who masters "${t}" will be able to:`, options: ['Solve related problems confidently', 'Only memorise facts', 'Skip advanced topics', 'Avoid the subject entirely'], correct: 0, explanation: 'Mastery enables confident problem-solving.' },
    { question: `Which statement about "${t}" is most accurate?`, options: ['It is well-established and widely applied', 'It is controversial and unproven', 'It applies only to mathematics', 'It was recently introduced'], correct: 0, explanation: `"${t}" is a well-established ${subject} concept.` },
  ];
}

function getMockResponse(question) {
  const lower = question.toLowerCase();
  if (lower.includes('photosynthesis')) {
    return `Dear student,\n\n**Photosynthesis** is how green plants make food using sunlight.\n\n**Equation:**\n> 6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂\n\n**Two stages:**\n1. **Light-dependent reactions** (thylakoids) — splits water, produces ATP & O₂\n2. **Calvin Cycle** (stroma) — fixes CO₂ into glucose\n\nI hope you understand. If you have more doubts, feel free to ask! 😊`;
  }
  if (lower.includes('newton') || (lower.includes('force') && lower.includes('law'))) {
    return `Dear student,\n\n**Newton's Three Laws of Motion:**\n\n**1st — Inertia:** An object stays at rest or moves uniformly unless acted on by a net force.\n\n**2nd — F = ma:** Net force = mass × acceleration\n\n**3rd — Action/Reaction:** Every action has an equal and opposite reaction.\n\n🚀 Example: Rocket expels gas down → gas pushes rocket up!\n\nI hope you understand. If you have more doubts, feel free to ask! 😊`;
  }
  if (lower.includes('quadratic')) {
    return `Dear student,\n\n**Quadratic Equation:** ax² + bx + c = 0\n\n**Formula:**\n> x = (−b ± √(b²−4ac)) / 2a\n\n**Example:** x² + 5x + 6 = 0 → **x = −2 or x = −3**\n\nI hope you understand. If you have more doubts, feel free to ask! 😊`;
  }
  return `Dear student,\n\nAdd your **free** Gemini API key to the **.env** file:\n\`\`\`\nVITE_GEMINI_API_KEY=AIzaSy...\n\`\`\`\nGet a free key at: **[aistudio.google.com](https://aistudio.google.com/app/apikey)**\n\nI hope you understand. If you have more doubts, feel free to ask! 😊`;
}
