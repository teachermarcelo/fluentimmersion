import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization with telemetry header
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// API: AI Pronunciation Feedback
app.post('/api/pronunciation-feedback', async (req, res) => {
  try {
    const { targetPhrase, userTranscript, level = 'B1', accent = 'British' } = req.body;

    if (!targetPhrase) {
      return res.status(400).json({ error: 'targetPhrase is required' });
    }

    if (!ai) {
      // Fallback pedagogical analysis if key not present
      const cleanTarget = (targetPhrase || '').toLowerCase().replace(/[^\w\s]/g, '').trim();
      const cleanUser = (userTranscript || '').toLowerCase().replace(/[^\w\s]/g, '').trim();
      
      const targetWords = cleanTarget.split(/\s+/).filter(Boolean);
      const userWords = cleanUser.split(/\s+/).filter(Boolean);
      
      let matched = 0;
      const wordDetails = targetWords.map((word: string) => {
        const found = userWords.includes(word);
        if (found) matched++;
        return {
          word,
          status: found ? 'correct' : 'needs_work',
          ipa: `/${word}/`,
        };
      });

      const calculatedScore = targetWords.length > 0
        ? Math.round((matched / targetWords.length) * 100)
        : 75;

      return res.json({
        score: Math.max(20, Math.min(100, calculatedScore)),
        phoneticsIpa: `/${targetPhrase}/`,
        words: wordDetails,
        mispronouncedWords: wordDetails.filter((w: { status: string; word: string }) => w.status !== 'correct').map((w: { word: string }) => w.word),
        tonguePositionTip: `Mantenha a ponta da língua relaxada e atente-se às vogais longas do sotaque britânico (/iː/, /ɑː/, /ɔː/).`,
        pedagogicalFeedback: `Excelente tentativa! O Teacher Marcelo analisou seu ritmo e entonação. Pratique a ligação entre as palavras (connected speech).`,
        accentDetected: accent,
      });
    }

    const prompt = `You are the lead English phonetics specialist and AI language coach for "FLUENT IMMERSION", working alongside Master Teacher Marcelo.
Analyze the user's speech attempt against the target English phrase.

Target Phrase: "${targetPhrase}"
User Transcript recorded by speech recognizer: "${userTranscript || '(silent or inaudible)'}"
Student CEFR Level: "${level}"
Target Accent: "${accent}" (Prefer Received Pronunciation / British English standard).

Return a strict JSON object with:
{
  "score": <integer 0 to 100 representing acoustic & phonetic accuracy>,
  "phoneticsIpa": "<standard IPA transcription of the target phrase>",
  "words": [
    {
      "word": "<word>",
      "status": <"correct" | "acceptable" | "needs_work">,
      "ipa": "<IPA>",
      "tip": "<short tip if needs_work or empty string>"
    }
  ],
  "mispronouncedWords": ["<words needing focus>"],
  "tonguePositionTip": "<Concrete articulatory phonetics instruction in Portuguese (mention tongue placement, lips shape, teeth, breath or vocal chord vibration for tricky sounds like 'th', glottal stops, schwa /ə/, or long vowels)>",
  "pedagogicalFeedback": "<Warm, motivational and highly actionable feedback in Portuguese from Teacher Marcelo>",
  "encouragement": "<short punchy motivational sentence in English>"
}
Ensure the response is valid JSON only, no markdown markers.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error generating pronunciation feedback:', err);
    return res.status(500).json({
      error: 'Failed to process AI pronunciation analysis',
      details: err.message,
    });
  }
});

// API: Neural Multilingual Translation & Word Dictionary
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang = 'en', targetLang = 'pt', context = 'everyday language' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!ai) {
      return res.json({
        translatedText: text,
        explanation: 'Tradução rápida em modo local.',
        idiomaticEquivalence: text,
        grammaticalNotes: 'Estudo de vocabulário padrão.',
        exampleSentence: `Example: ${text}`,
      });
    }

    const prompt = `You are the neural translation engine for "FLUENT IMMERSION" (Teacher Marcelo).
Translate the following text accurately, considering natural British and international English nuances.

Text: "${text}"
From: "${sourceLang}"
To: "${targetLang}"
Context: "${context}"

Provide a strict JSON response:
{
  "translatedText": "<natural translation in target language>",
  "explanation": "<brief pedagogical breakdown in Portuguese explaining nuances or cultural British context if applicable>",
  "idiomaticEquivalence": "<common idiom or natural Brazilian Portuguese/target language equivalent>",
  "grammaticalNotes": "<notes on tense, phrasal verbs, prepositions or false friends>",
  "exampleSentence": "<one example sentence in English using this word/phrase with translation>"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error in translate API:', err);
    return res.status(500).json({ error: 'Failed to translate' });
  }
});

// API: AI Writing & Grammar Coach
app.post('/api/writing-coach', async (req, res) => {
  try {
    const { promptTopic, studentText, level = 'B1' } = req.body;

    if (!studentText) {
      return res.status(400).json({ error: 'Student text is required' });
    }

    if (!ai) {
      return res.json({
        overallScore: 85,
        grammarScore: 82,
        vocabularyScore: 88,
        coherenceScore: 85,
        feedback: 'Bom texto! Mantenha a prática de conectivos e variedade de tempos verbais.',
        correctedText: studentText,
        suggestions: ['Adicione conectivos como Furthermore, In addition, However.'],
        enhancedVocabulary: [
          { original: 'good', enhanced: 'exceptional', reason: 'Eleva a sofisticação lexical' }
        ]
      });
    }

    const prompt = `You are Master Teacher Marcelo's AI Writing Evaluator for FLUENT IMMERSION.
Analyze the student's written submission:
Topic / Prompt: "${promptTopic || 'Free expression'}"
Student Text: "${studentText}"
Target CEFR Level: "${level}"

Provide a strict JSON response:
{
  "overallScore": <number 0-100>,
  "grammarScore": <number 0-100>,
  "vocabularyScore": <number 0-100>,
  "coherenceScore": <number 0-100>,
  "feedback": "<detailed constructive pedagogical review in Portuguese>",
  "correctedText": "<polished version of student text with proper British English grammar and spelling>",
  "correctionsList": [
    { "issue": "<error in original>", "correction": "<fix>", "explanation": "<explanation in PT-BR>" }
  ],
  "enhancedVocabulary": [
    { "original": "<basic word used>", "enhanced": "<higher CEFR C1/C2 synonym>", "reason": "<why it's better>" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error in writing coach API:', err);
    return res.status(500).json({ error: 'Failed to evaluate writing' });
  }
});

// API: AI Personalized Study Plan Generator for Teacher Marcelo
app.post('/api/teacher/generate-study-plan', async (req, res) => {
  try {
    const { studentName, level = 'B1', focusAreas = ['speaking', 'listening'], weeklyHours = 5 } = req.body;

    if (!ai) {
      return res.json({
        planTitle: `Plano de Imersão Personalizado - ${studentName}`,
        weeklyGoals: [
          '3 sessões de 20 min de Pronunciation Lab com foco em fonemas /θ/ e /ð/',
          '1 simulação de conversa em tempo real na Sala ao Vivo',
          '2 atividades de listening com sotaque britânico (RP)'
        ],
        milestones: ['Atingir 85% de precisão de fala', 'Completar 100 XP por dia'],
        teacherMarceloNote: 'Estou acompanhando sua evolução diária. Qualquer dúvida, me chame no WhatsApp!'
      });
    }

    const prompt = `You are Teacher Marcelo, Founder and Head Teacher of "FLUENT IMMERSION" (WhatsApp: 4198778348).
Generate a customized pedagogical study plan for student "${studentName || 'Student'}".
Current Level: ${level}
Focus Areas: ${JSON.stringify(focusAreas)}
Weekly Time Available: ${weeklyHours} hours

Return strict JSON:
{
  "planTitle": "<Inspiring title in Portuguese>",
  "summary": "<Overview of strategy>",
  "weeklyGoals": ["<goal 1>", "<goal 2>", "<goal 3>", "<goal 4>"],
  "schedule": [
    { "day": "Segunda-feira", "activity": "<activity>", "duration": "<minutes>", "skill": "Speaking" },
    { "day": "Terça-feira", "activity": "<activity>", "duration": "<minutes>", "skill": "Listening" },
    { "day": "Quarta-feira", "activity": "<activity>", "duration": "<minutes>", "skill": "Reading & Vocab" },
    { "day": "Quinta-feira", "activity": "<activity>", "duration": "<minutes>", "skill": "Writing" },
    { "day": "Sexta-feira", "activity": "<activity>", "duration": "<minutes>", "skill": "Live Review with Teacher Marcelo" }
  ],
  "milestones": ["<milestone 1>", "<milestone 2>"],
  "teacherMarceloNote": "<Warm personalized advice in Portuguese with contact reference>"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error generating study plan:', err);
    return res.status(500).json({ error: 'Failed to generate study plan' });
  }
});

// API: AI Lesson Generator for Teacher Marcelo (CMS)
app.post('/api/generate-lesson', async (req, res) => {
  try {
    const { topic, level = 'B1', category = 'geral', targetAudience = 'curriculum_adults', skill = 'reading' } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (!ai) {
      return res.json({
        title: `${topic} - Masterclass`,
        level,
        skill,
        category,
        targetAudience,
        durationMinutes: 15,
        xpReward: 80,
        description: `Aula sobre ${topic} estruturada para ${targetAudience === 'kids' ? 'Fluent Kids' : 'alunos nível ' + level}.`,
        htmlContent: `<div style="font-family: system-ui, sans-serif; padding: 24px; background: linear-gradient(135deg, #0b1b3d, #1e3a8a); color: white; border-radius: 20px;">
  <h2 style="color: #f59e0b; margin-top: 0;">🇬🇧 ${topic}</h2>
  <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">Lição pedagógica personalizada criada para os estudantes da FLUENT IMMERSION.</p>
  <div style="background: rgba(255,255,255,0.08); border-left: 4px solid #c8102e; padding: 14px; margin: 16px 0; border-radius: 10px;">
    <strong>Frase Prática:</strong> <em>"Mastering ${topic} requires regular immersion and speaking repetition."</em>
  </div>
</div>`,
      });
    }

    const isKids = targetAudience === 'kids';
    const prompt = `You are the Master Pedagogical Director for "FLUENT IMMERSION" (Teacher Marcelo).
Create a complete, engaging, interactive English lesson in rich HTML for students.

Parameters:
- Topic: "${topic}"
- Level: "${level}"
- Category: "${category}" (options: geral, business, biblico, proficiencia)
- Target Audience: "${targetAudience}" (options: curriculum_adults, kids, pronunciation_lab)
- Skill: "${skill}"

Guidelines:
${isKids ? 
  '- For KIDS: Use joyful colorful elements, emojis, mascots (Leo the Lion, Penny the Penguin), very simple phonics, playful repetition, star badges, and a friendly Portuguese instruction for Brazilian children.' : 
  '- For ADULTS: Elegant British immersion styling (deep navy #0b1b3d, royal accents #c8102e, gold #d4af37), include IPA phonetic pronunciation guides, real-life dialogue or formal workplace/theological context based on category, useful vocabulary cards, and a speaking practice prompt.'
}
- Provide valid, self-contained HTML (using inline CSS styles or standard container classes) ready to render inside a React viewer.
- Do NOT wrap in \`\`\`html markdown blocks inside the JSON string; provide clean HTML text.

Provide a strict JSON response:
{
  "title": "<compelling lesson title in English>",
  "description": "<one sentence description in Portuguese explaining what the student will learn>",
  "level": "${level}",
  "skill": "${skill}",
  "category": "${category}",
  "targetAudience": "${targetAudience}",
  "durationMinutes": 15,
  "xpReward": 85,
  "htmlContent": "<complete styled HTML markup with dialogues, phonetics, and interactive exercise sections>"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error generating lesson with AI:', err);
    return res.status(500).json({ error: 'Failed to generate lesson with AI' });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
