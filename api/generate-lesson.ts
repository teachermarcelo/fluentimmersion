import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';

interface ApiRequest extends IncomingMessage {
  body?: any;
  method?: string;
}

interface ApiResponse extends ServerResponse {
  status: (statusCode: number) => ApiResponse;
  json: (data: any) => void;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, level = 'B1', category = 'geral', targetAudience = 'curriculum_adults', skill = 'reading' } = req.body || {};

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        fallbackNeeded: true,
        message: 'No GEMINI_API_KEY configured on server, client will use pedagogical engine.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

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
${
  isKids
    ? '- For KIDS: Use joyful colorful elements, emojis, mascots (Leo the Lion, Penny the Penguin), very simple phonics, playful repetition, star badges, and a friendly Portuguese instruction for Brazilian children.'
    : '- For ADULTS: Elegant British immersion styling (deep navy #0b1b3d, royal accents #c8102e, gold #d4af37), include IPA phonetic pronunciation guides, real-life dialogue or formal workplace/theological context based on category, useful vocabulary cards with TTS buttons, and a speaking practice prompt.'
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
    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error('Error generating lesson with AI:', err);
    return res.status(500).json({ error: 'Failed to generate lesson with AI', details: err?.message });
  }
}
