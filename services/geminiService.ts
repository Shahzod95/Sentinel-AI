import { GoogleGenAI } from "@google/genai";
import { CrimeIncident, RegionStats, Language } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCrimeAnalysis = async (
  stats: RegionStats[],
  recentCrimes: CrimeIncident[],
  language: Language
): Promise<string> => {
  const client = getAiClient();
  if (!client) return "API Key Configuration Missing. Please check your environment variables.";

  const summary = stats.map(s => 
    `${s.regionName}: ${s.totalCrimes} crimes, Risk Score ${s.riskScore}, Top Issue: ${s.topCrimeType}`
  ).join('\n');

  const langName = language === 'uz' ? "Uzbek" : language === 'ru' ? "Russian" : "English";

  const prompt = `
    As a Senior Crime Analyst for Tashkent, Uzbekistan, provide a brief executive summary and 3 actionable tactical recommendations based on this district data:
    ${summary}
    
    Focus on resource allocation and predictive risks. Keep it concise (under 200 words).
    IMPORTANT: Provide the response in ${langName}.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "AI Analysis service is temporarily unavailable.";
  }
};

export const chatWithData = async (
  message: string,
  contextData: { stats: RegionStats[], crimes: CrimeIncident[] },
  history: { role: string, parts: { text: string }[] }[],
  language: Language
) => {
  const client = getAiClient();
  if (!client) throw new Error("API Key missing");

  // Create a lightweight context summary to avoid token limits
  const contextSummary = JSON.stringify({
    stats: contextData.stats,
    recentSample: contextData.crimes.slice(0, 20).map(c => ({ type: c.type, district: c.district, date: c.date }))
  });

  const langName = language === 'uz' ? "Uzbek" : language === 'ru' ? "Russian" : "English";

  const systemInstruction = `
    You are 'Sentinel', an advanced AI Crime Analytics Assistant for Uzbekistan. 
    You have access to a dataset of crime statistics in JSON format.
    Current Data Context: ${contextSummary}
    
    Rules:
    1. Answer specifically about the provided data.
    2. Be professional, concise, and objective.
    3. If asked about future trends, use the data to make a logical inference but state it is a prediction.
    4. Do not make up crimes that are not in the context.
    5. Always reply in ${langName}.
  `;

  const chat = client.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction }
  });

  const response = await chat.sendMessage({
    message: message
  });

  return response.text;
};