import { GoogleGenAI, Type } from "@google/genai";
import { GlobalTheme } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Analyze Brand Guidelines (PDF/Image)
export const analyzeBrandGuidelines = async (
  fileBase64: string, 
  mimeType: string
): Promise<GlobalTheme> => {
  
  // Validate MIME type
  const supportedMimeTypes = [
    'application/pdf',
    'image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'
  ];

  if (!supportedMimeTypes.includes(mimeType)) {
    throw new Error(`Unsupported file type: ${mimeType}. Please upload a PDF or Image (PNG, JPEG, WEBP).`);
  }

  if (!fileBase64) {
    throw new Error("File content is empty or invalid.");
  }

  const prompt = `
    You are a Brand Strategy Expert. Analyze the attached Brand Guidelines document.
    Extract the core brand identity elements into the following strict JSON structure.
    
    If specific fields are not explicitly found, infer them based on the tone and visual style of the document.
    
    IMPORTANT RULES:
    1. Extract exactly 5 key colors for the palette.
    2. USE BRITISH ENGLISH SPELLING AND GRAMMAR for all generated content (e.g. 'colour', 'emphasise', 'centre', 'programme', 'realise'). 
       Do not use American spellings.
    
    Fields to extract:
    1. Brand Essence (Mission/Vision)
    2. Core Values
    3. Personality
    4. Visual Identity (Primary, Secondary, Accent, Neutral Light, Neutral Dark)
    5. Typography
    6. Voice & Tone
    7. Writing Rules (Grammar/Mechanics)
    8. Market Positioning (Strategic Positioning)
    9. Avoid List (Never List)
    10. Customer Engagement Style (Interaction Style)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType, data: fileBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brand_essence: { type: Type.STRING },
            core_values: { type: Type.ARRAY, items: { type: Type.STRING } },
            personality: { type: Type.STRING },
            visual_identity: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING },
                secondary: { type: Type.STRING },
                accent: { type: Type.STRING },
                neutral_light: { type: Type.STRING },
                neutral_dark: { type: Type.STRING },
                color_meanings: { type: Type.STRING }
              }
            },
            typography: {
              type: Type.OBJECT,
              properties: {
                primary_font: { type: Type.STRING },
                secondary_font: { type: Type.STRING },
                usage_notes: { type: Type.STRING }
              }
            },
            voice_and_tone: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                do_say: { type: Type.ARRAY, items: { type: Type.STRING } },
                dont_say: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            grammar_mechanics: { type: Type.STRING },
            strategic_positioning: { type: Type.STRING },
            never_list: { type: Type.ARRAY, items: { type: Type.STRING } },
            interaction_style: { type: Type.STRING }
          }
        }
      }
    });

    if (!response.text) throw new Error("No response text from Gemini");
    return JSON.parse(response.text) as GlobalTheme;
  } catch (error: any) {
    console.error("Gemini Brand Analysis Error:", error);
    if (error.status === 429) {
      throw new Error("Gemini API Quota Exceeded. Please try again in a minute.");
    }
    // Handle 400 Invalid Argument (often file size or structure issues)
    if (error.message && error.message.includes("400")) {
         throw new Error("AI Request Failed (400): The file might be too large or the format is incompatible. Try converting to a standard Image/PDF or reducing size.");
    }
    throw new Error(`Failed to analyze brand guidelines: ${error.message}`);
  }
};

// Find Social Links using Google Search Grounding
export const findSocialLinks = async (businessName: string, location?: string): Promise<string[]> => {
  const query = `Find the official social media profiles for "${businessName}" located in "${location || ''}". Look for Twitter, LinkedIn, Facebook, Instagram, and YouTube.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: { parts: [{ text: query }] },
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const links = new Set<string>();

    // 1. Extract from Grounding Chunks (Source of Truth)
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
           const uri = chunk.web.uri.toLowerCase();
           if (isSocialUrl(uri)) links.add(chunk.web.uri);
        }
      });
    }

    // 2. Fallback: Extract from text (if the model mentions them in the answer)
    if (response.text) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const matches = response.text.match(urlRegex);
      if (matches) {
        matches.forEach((url) => {
          if (isSocialUrl(url)) links.add(url);
        });
      }
    }

    return Array.from(links);

  } catch (error) {
    console.error("Gemini Social Search Error:", error);
    return [];
  }
};

const isSocialUrl = (url: string): boolean => {
  const socialDomains = ['twitter.com', 'x.com', 'linkedin.com', 'facebook.com', 'instagram.com', 'youtube.com', 'tiktok.com', 'pinterest.com'];
  return socialDomains.some(domain => url.includes(domain));
};

export interface ExtractedEntity {
  name: string;
  description: string;
  entity_type: string;
  wikipedia_url?: string;
}

export const extractEntities = async (text: string): Promise<ExtractedEntity[]> => {
  if (!text || text.length < 20) return [];

  const prompt = `
    Analyze the following text and extract key knowledge entities (People, Organizations, Places, Concepts) that would be valuable for a Semantic Knowledge Graph.
    
    For each entity:
    1. Provide a canonical Name.
    2. Provide a brief description (max 1 sentence).
    3. Categorize it (e.g. Person, Organization, Place, Service, Concept).
    4. If you are >90% confident of the Wikipedia URL, include it. Otherwise leave it null.
    
    TEXT TO ANALYZE:
    "${text.substring(0, 8000)}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              entity_type: { type: Type.STRING },
              wikipedia_url: { type: Type.STRING, nullable: true },
            }
          }
        }
      }
    });

    if (!response.text) return [];
    const entities = JSON.parse(response.text);
    return entities.map((e: any) => ({
      ...e,
      wikipedia_url: e.wikipedia_url || null 
    }));
  } catch (error) {
    console.error("Entity Extraction Error:", error);
    return [];
  }
};
