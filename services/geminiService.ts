
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Always use the API_KEY directly from environment variables via a named parameter.
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateThemeBackground = async (): Promise<string | null> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: "A breathtaking high-resolution professional architectural photograph of the Zhanjiang Bay Bridge at dusk, vibrant sunset colors reflecting on the South China Sea, modern city skyline in distance, cinematic lighting, 8k resolution, photorealistic, elegant branding space for a mobile company logo." }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Error generating background:", error);
  }
  return null;
};

export const evaluateInterview = async (history: any[], position: any) => {
  const ai = getAIClient();
  const prompt = `
    作为湛江移动公司的资深面试官，请根据以下面试对话记录和岗位要求，对候选人进行评估。
    
    岗位名称: ${position.title}
    岗位要求: ${position.requirements.join(', ')}
    
    面试对话记录:
    ${history.map(h => `${h.role}: ${h.text}`).join('\n')}
    
    请输出 JSON 格式：
    {
      "score": number (0-100),
      "matchDegree": number (0-100),
      "strengths": string[],
      "weaknesses": string[],
      "overallEvaluation": string
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          matchDegree: { type: Type.NUMBER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          overallEvaluation: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const parseResume = async (base64File: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64File, mimeType: "application/pdf" } },
        { text: "请提取这份简历的关键信息：姓名、专业、技能点、工作年限。以 JSON 格式返回。" }
      ]
    },
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text);
};
