import express from 'express';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const apiKey = process.env.GEMINI_API_KEY;

// Initialize AI client only if valid key is present
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'PLACEHOLDER_API_KEY') {
    ai = new GoogleGenAI({ apiKey });
}

router.post('/match', async (req, res) => {
    const { userInput } = req.body;

    if (!userInput) {
        return res.status(400).json({ error: 'Missing userInput' });
    }

    if (!ai) {
        return res.status(503).json({ error: 'AI service not configured (API Key missing)' });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: `User is looking for a domestic helper with these criteria: "${userInput}". 
            Analyze the request and return a JSON object with predicted filter parameters: nationality (one of: Filipino, Indonesian, Thai, Myanmar, Local), 
            experience (one of: New to HK, Finished Contract, Ex-HK, Overseas Experience), and a list of key skills mentioned.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        nationality: { type: Type.STRING },
                        experience: { type: Type.STRING },
                        skills: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        summary: { type: Type.STRING, description: "A friendly summary of what they are looking for in English." }
                    },
                    required: ["nationality", "experience", "skills", "summary"]
                }
            }
        });

        if (response.text) {
            res.json(JSON.parse(response.text));
        } else {

            res.status(500).json({ error: "Empty response from AI" });
        }

    } catch (error) {
        console.error("Gemini AI Match Error:", error);
        res.status(500).json({ error: 'AI processing failed' });
    }
});

router.post('/generate-job-description', async (req, res) => {
    const { details } = req.body;

    if (!details) {
        return res.status(400).json({ error: 'Missing details' });
    }

    if (!ai) {
        return res.status(503).json({ error: 'AI service not configured (API Key missing)' });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: `Generate a professional domestic helper job description in English based on these notes: "${details}". 
            Include sections for: Job Overview, Main Responsibilities, Requirements, and Compensation. Ensure it sounds encouraging and professional.`,
        });

        res.json({ description: response.text });
    } catch (error) {
        console.error("Gemini Job Gen Error:", error);
        res.status(500).json({ error: 'AI generation failed' });
    }
});

export default router;
