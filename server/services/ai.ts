import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "default_key"
});

export interface EventResolution {
  answer: "YES" | "NO";
  confidence: number;
  reasoning: string;
}

export async function resolveEventWithAI(eventTitle: string, eventDescription: string): Promise<EventResolution> {
  try {
    const prompt = `You are an AI judge for a prediction betting platform. You need to determine if the following prediction event should be answered YES or NO based on current real-world information and likelihood.

Event: "${eventTitle}"
Description: "${eventDescription}"

Please analyze this event and provide:
1. A definitive YES or NO answer
2. Your confidence level (0-100)
3. Brief reasoning for your decision

Respond with JSON in this exact format:
{
  "answer": "YES" or "NO",
  "confidence": number between 0 and 100,
  "reasoning": "brief explanation of your decision"
}`;

    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: "You are an expert prediction analyst. Always provide factual, unbiased assessments based on available information."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      answer: result.answer === "YES" ? "YES" : "NO",
      confidence: Math.max(0, Math.min(100, result.confidence || 50)),
      reasoning: result.reasoning || "AI analysis completed"
    };
  } catch (error) {
    console.error("Failed to resolve event with AI:", error);
    // Fallback to random resolution if AI fails
    return {
      answer: Math.random() > 0.5 ? "YES" : "NO",
      confidence: 50,
      reasoning: "AI resolution unavailable, random result provided"
    };
  }
}
