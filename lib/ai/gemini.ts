
import { GoogleGenAI, Type } from "@google/genai";
import { GlobalTheme } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Analyze Brand Guidelines (PDF/Image)
export const analyzeBrandGuidelines = async (
  fileBase64: string, 
  mimeType: string
): Promise<GlobalTheme> => {
  // ... (Existing implementation)
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
    
    IMPORTANT RULES:
    1. Extract exactly 5 key colors.
    2. USE BRITISH ENGLISH.
    
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
    if (error.message && error.message.includes("400")) {
         throw new Error("AI Request Failed (400): The file might be too large or the format is incompatible.");
    }
    throw new Error(`Failed to analyze brand guidelines: ${error.message}`);
  }
};

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
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
           const uri = chunk.web.uri.toLowerCase();
           if (isSocialUrl(uri)) links.add(chunk.web.uri);
        }
      });
    }
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
    Analyze the following text and extract key knowledge entities (People, Organizations, Places, Concepts).
    
    For each entity:
    1. Canonical Name.
    2. Brief description (max 1 sentence).
    3. Categorize (e.g. Person, Organization, Place, Service, Concept).
    4. If >90% confident of the Wikipedia URL, include it. Otherwise null.
    
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

export const suggestSubLocations = async (locationName: string, region?: string): Promise<string[]> => {
  const prompt = `
    Identify the immediate sub-locations (boroughs, districts, or major neighbourhoods) within the location: "${locationName}" ${region ? `(${region})` : ''}.
    Return ONLY a raw JSON array of strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Sub-location suggestion failed:", error);
    return [];
  }
};

export const generateLandmarks = async (locationName: string, region?: string): Promise<string[]> => {
  const prompt = `
    List 10 distinct, popular landmarks, points of interest, or significant locations in: "${locationName}" ${region ? `(${region})` : ''}.
    Return ONLY a raw JSON array of strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Landmark generation failed:", error);
    return [];
  }
};

export const generateFAQs = async (text: string): Promise<{ question: string; answer: string }[]> => {
  if (!text || text.length < 50) return [];

  const prompt = `
    You are analyzing content for a business page. Your task has TWO steps:

    STEP 1 - EXTRACT EXISTING FAQs:
    First, carefully scan the content for any existing FAQ-style patterns. Look for:
    - Questions followed by answers (with or without "Q:" or "A:" prefixes)
    - Sentences starting with question words (What, How, Why, When, Where, Which, Can, Do, Is, Are)
    - Sections explicitly labeled as FAQ, Q&A, or similar
    - Any question-answer pairs embedded in the text

    STEP 2 - GENERATE ADDITIONAL FAQs (if needed):
    If fewer than 5 FAQs were found, generate additional relevant questions based on the content.
    Focus on questions a potential customer would actually ask about this business/service.

    RULES:
    - Prioritize EXTRACTING real FAQs from the content over generating new ones
    - Each 'answer' MUST be between 55 and 90 words
    - Use British English
    - Return 3-5 FAQs total (prefer extracted ones when available)
    
    CONTENT TO ANALYZE:
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
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
            }
          }
        }
      }
    });

    if (!response.text) return [];
    return JSON.parse(response.text);
  } catch (error) {
    console.error("FAQ Generation Error:", error);
    return [];
  }
};

// --- WRITING ASSISTANT FUNCTIONS ---

interface WritingContext {
  keyword?: string;
  fieldName: string;
  brandTheme?: GlobalTheme | null;
  existingText?: string;
  contextContent?: string;
}

export const generateDraftContent = async (ctx: WritingContext): Promise<string> => {
  const brandVoice = ctx.brandTheme ? `
    Brand Personality: ${ctx.brandTheme.personality}
    Tone: ${ctx.brandTheme.voice_and_tone.description}
    Do Not Say: ${ctx.brandTheme.voice_and_tone.dont_say?.join(', ')}
  ` : "Tone: Professional and Authoritative";

  const isRichText = ctx.fieldName.toLowerCase().includes('content') || ctx.fieldName.toLowerCase().includes('body');
  const isMetaDescription = ctx.fieldName.toLowerCase().includes('meta') || ctx.fieldName.toLowerCase().includes('description') || ctx.fieldName.toLowerCase().includes('excerpt');

  let contentContext = '';
  if (ctx.contextContent && ctx.contextContent.length > 50) {
    contentContext = `
    
    REFERENCE CONTENT (use this to ensure relevance):
    "${ctx.contextContent.substring(0, 3000)}"
    `;
  }

  const prompt = `
    You are a professional copywriter for a business.
    Write content for the field: "${ctx.fieldName}".
    Target Keyword: "${ctx.keyword || 'General'}"
    ${contentContext}
    ${brandVoice}
    
    Instructions:
    - Write specifically for the "${ctx.fieldName}" context.
    - If it's a 'Headline' or 'Title', keep it punchy and under 10 words. NO Markdown. Plain text only.
    - If it's a 'Description' or 'Meta Description', keep it under135 characters. NO Markdown. Plain text only. MUST be directly relevant to the reference content if provided.
    - If it's 'Body Content', use markdown headers and short paragraphs.
    - Integrate the keyword naturally.
    - Use British English.
    - **CRITICAL**: Return ONLY the text content. No conversational filler like "Here is the text". No quotes around the text.
    - **CRITICAL**: DoNOT include any meta-commentary or explanations. Just the final copy.
    ${!isRichText && !isMetaDescription ? "- **STRICTLY PLAIN TEXT**: Do not use bold (**), italics (*), or headers (#). Plain text only." : ""}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] }
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Draft Gen Error:", error);
    throw new Error("Failed to generate draft.");
  }
};

export const improveContent = async (ctx: WritingContext): Promise<string> => {
  const brandVoice = ctx.brandTheme ? `
    Brand Personality: ${ctx.brandTheme.personality}
    Tone: ${ctx.brandTheme.voice_and_tone.description}
  ` : "";

  const isRichText = ctx.fieldName.toLowerCase().includes('content') || ctx.fieldName.toLowerCase().includes('body');
  const isMetaDescription = ctx.fieldName.toLowerCase().includes('meta') || ctx.fieldName.toLowerCase().includes('description') || ctx.fieldName.toLowerCase().includes('excerpt');

  let contentContext = '';
  if (ctx.contextContent && ctx.contextContent.length > 50) {
    contentContext = `
    
    REFERENCE CONTENT(for relevance):
    "${ctx.contextContent.substring(0, 3000)}"
    `;
  }

  const prompt = `
    Rewrite and improve the following text.
    
    ${contentContext}
    ${brandVoice}
    
    Goal:
    - Improve clarity, flow, and impact.
    - Correct any grammar issues (Use British English).
    - Ensure the tone matches the brand personality.
    - If a keyword "${ctx.keyword}" is provided, ensure it is naturally included.
    - ${isMetaDescription ? 'Keep it under 135 characters. MUST be directly relevant to the reference content if provided.' : ''}
    - **CRITICAL**: Return ONLY the improved text. No conversational filler.
    - **CRITICAL**: Do NOT include commentary.
    ${!isRichText && !isMetaDescription ? "- **STRICTLY PLAIN TEXT**: Remove any markdown formatting." : ""}
    
    TEXT TO IMPROVE:
    "${ctx.existingText}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] }
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Improvement Error:", error);
    throw new Error("Failed to improve content.");
  }
};

// --- ENTITY MATCHING ---

export const matchEntities = async (content: string, allEntities: {id: string, name: string, description?: string}[]): Promise<string[]> => {
  if (!content || content.length < 50 || allEntities.length === 0) return [];

  // Simplify entities to save tokens
  const simplifiedEntities = allEntities.map(e => ({ id: e.id, name: e.name, desc: e.description?.substring(0, 50) }));

  const prompt = `
    I have a piece of content and a list of Knowledge Graph entities.
    Identify which entities are explicitly mentioned or strongly relevant to the content.
    
    Content:
    "${content.substring(0, 5000)}..."
    
    Entities List (JSON):
    ${JSON.stringify(simplifiedEntities)}
    
    Return ONLY a raw JSON array of the matching Entity IDs strings.
    Example: ["uuid-1", "uuid-2"]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Entity matching failed:", error);
    return [];
  }
};
