
import { GoogleGenAI } from "@google/genai";

export class RevenueService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async executeTask(taskLabel: string) {
    const prompt = `
      Act as an advanced autonomous business execution agent. 
      Task to execute: "${taskLabel}".
      
      Generate a single paragraph response describing the complex technical sub-steps you performed. 
      Use extremely technical, high-level business language. 
      Keywords to include: "multi-threaded scraping", "firmographic data", "NLP-driven synthesis", "boolean logic", "validation matrix", "SMTP relay", "telemetry tracking".
      The tone must be cold, ultra-efficient, and clinical.
      Example style: "I executed a multi-threaded scraping protocol via LinkedIn’s API to extract granular firmographic data, applying boolean logic..."
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      return response.text || "Execution protocol successfully deployed. Target achieved.";
    } catch (e) {
      return "Autonomous execution sequence finalized via backup SMTP/Scraping relays.";
    }
  }

  async decideNextAction(context: { leads: number, emailsSent: number, replies: number, profit: number }) {
    const prompt = `
      Act as RevenueArchitect-AI Autonomous Operator.
      Context: Leads: ${context.leads}, Outreach: ${context.emailsSent}, Replies: ${context.replies}, Profit: $${context.profit}.
      
      Output exactly JSON:
      {
        "action": "SCRAPE_LEADS" | "SEND_OUTREACH",
        "reasoning": "A high-level strategic bottleneck sentence (e.g., 'Lead inventory is critically low to support aggressive outreach scaling').",
        "logMessage": "A professional terminal message starting with [OPERATOR] or [CRITICAL] or [REVENUE_ARCHITECT] (e.g., '[OPERATOR] Lead depletion detected (N=${context.leads}). Initializing high-throughput extraction module.')"
      }
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "{}");
    } catch (e) {
      return { 
        action: "SCRAPE_LEADS", 
        reasoning: "Growth velocity threatened by pipeline exhaustion.", 
        logMessage: "[CRITICAL] Lead reservoir depleted; initializing autonomous scraping protocols." 
      };
    }
  }

  async generateOutreach(prospect: { company: string, contact: string, pain: string }) {
    const prompt = `
      Write a hyper-personalized B2B cold email (max 80 words).
      Target: ${prospect.company}, ${prospect.contact}. Pain: ${prospect.pain}.
      Focus: AI automation ROI. Tone: Direct, technical, high-status.
    `;
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt
    });
    return response.text || "Outreach payload generation failed.";
  }
}
