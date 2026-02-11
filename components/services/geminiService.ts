
'use server';

import { GoogleGenAI } from "@google/genai";

// This is now a Server Action
export const generatePortfolioInsight = async (topic: string): Promise<string | null> => {
  // process.env.API_KEY is available in the server context of Next.js
  if (!process.env.API_KEY) return "API Key missing. Please check your environment.";

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are a technical strategist for Akash Vishwakarma, a senior Full Stack Developer specializing in high-performance Next.js, AI Agents, and scalable systems (Kafka, Docker, Prisma). 
                 Topic: ${topic}. 
                 Write a 2-sentence punchy, professional, and slightly mysterious statement that highlights deep engineering expertise and architectural integrity.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || null;
  } catch (error) {
    console.error("Error generating insight:", error);
    return "Architecture offline. My systems are usually more resilient.";
  }
};
