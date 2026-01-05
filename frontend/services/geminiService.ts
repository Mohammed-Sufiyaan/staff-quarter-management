
import { GoogleGenAI } from "@google/genai";
import { Quarter, AllocationRequest, QuarterStatus } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async analyzeAllocationTrends(quarters: Quarter[], requests: AllocationRequest[]) {
    const vacantCount = quarters.filter(q => q.status === QuarterStatus.VACANT).length;
    const occupiedCount = quarters.filter(q => q.status === QuarterStatus.OCCUPIED).length;
    const pendingRequests = requests.filter(r => r.status === 'PENDING').length;

    const prompt = `
      As a Facilities Manager assistant, analyze this staff quarters data:
      - Total Quarters: ${quarters.length}
      - Vacant: ${vacantCount}
      - Occupied: ${occupiedCount}
      - Pending Allocation Requests: ${pendingRequests}

      Please provide a concise summary (max 100 words) of the current situation and suggest a priority action plan.
      Return the response in professional markdown format.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini analysis error:", error);
      return "Unable to generate AI analysis at this time.";
    }
  }

  async getBilingualTranslation(text: string, targetLang: 'gu' | 'en') {
    const prompt = `Translate the following text to ${targetLang === 'gu' ? 'Gujarati' : 'English'}: "${text}". Return only the translated text.`;
    
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      return text;
    }
  }
}
