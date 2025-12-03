import { GoogleGenAI } from "@google/genai";

// Safely access process.env
const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    console.warn("process.env.API_KEY is not accessible");
    return '';
  }
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

export const generateChatResponse = async (
  currentMessage: string,
  history: { role: 'user' | 'model'; text: string }[],
  contextSources: { type: string; title?: string; content: string }[],
  userSystemInstruction?: string
) => {
  if (!apiKey) {
    throw new Error("Missing API_KEY environment variable.");
  }

  // Construct a rich context block
  const contextBlock = contextSources.map((source, index) => {
    return `--- SOURCE ${index + 1} (${source.type.toUpperCase()}: ${source.title || 'Untitled'}) ---\n${source.content}\n----------------------------------`;
  }).join('\n\n');

  // We inject the dynamic context into the system instruction.
  // This ensures the model always has the latest context from the nodes
  // even if the conversation history is long.
  const systemInstruction = `
You are an AI assistant in a node-based workflow app.
Use the provided CONTEXT SOURCES to answer the user's query.

${userSystemInstruction ? `USER DEFINED ROLE/INSTRUCTION: ${userSystemInstruction}` : ''}

CONTEXT SOURCES:
${contextBlock}
`;

  // Map internal message format to Gemini API format
  const contents = [
    ...history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    })),
    {
      role: 'user',
      parts: [{ text: currentMessage }]
    }
  ];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};