
import { GoogleGenAI, Type } from "@google/genai";
import type { Business, GlobalTheme } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GeneratedPageContent {
  page_key: string; // Internal key to identify page type
  title: string;
  slug: string;
  content_html: string;
  seo_meta_desc: string;
}

const PAGE_DEFINITIONS = [
  { key: 'about', title: 'About Us', prompt: 'Write a detailed "About Us" page content telling the brand story, mission, and values.' },
  { key: 'contact', title: 'Contact Us', prompt: 'Write introductory text for a "Contact Us" page, encouraging users to reach out via form or phone.' },
  { key: 'terms', title: 'Terms of Service', prompt: 'Write a standard "Terms of Service" agreement placeholder text.' },
  { key: 'privacy', title: 'Privacy Policy', prompt: 'Write a standard "Privacy Policy" placeholder text complying with GDPR/CCPA principles.' },
  { key: 'downloads', title: 'Downloads Hub', prompt: 'Write an introductory paragraph for a "Downloads" library page where users can find resources.' },
  { key: 'tools', title: 'Free Tools', prompt: 'Write an introductory paragraph for a "Free Tools" page offering calculators and utilities.' },
  { key: 'case_studies', title: 'Case Studies', prompt: 'Write an introductory paragraph for a "Case Studies" page showcasing success stories.' },
  { key: 'industries', title: 'Industries We Serve', prompt: 'Write an introductory paragraph for an "Industries We Serve" page.' },
  { key: 'locations', title: 'Service Areas', prompt: 'Write an introductory paragraph for a "Locations" page listing service areas.' },
  { key: 'blog_root', title: 'Blog', prompt: 'Write an introductory paragraph for the main "Blog" home page.' },
];

export const generateCorePages = async (business: Business): Promise<GeneratedPageContent[]> => {
  const theme = business.global_theme as GlobalTheme;
  const context = `
    BUSINESS CONTEXT:
    Name: ${business.name}
    Industry: ${theme?.strategic_positioning || 'General Business'}
    Description: ${business.description}
    Tone: ${theme?.voice_and_tone?.description || 'Professional'}
    Location: ${business.address_locality}, ${business.address_country}
    Email: ${business.email || '[Insert Email]'}
  `;

  // Function to generate a single page
  const generatePage = async (def: typeof PAGE_DEFINITIONS[0]): Promise<GeneratedPageContent | null> => {
    const prompt = `
      You are a Senior Content Strategist.
      
      ${context}

      TASK: ${def.prompt}

      OUTPUT REQUIREMENTS:
      - title: SEO Optimized H1 (based on "${def.title}")
      - slug: URL friendly slug (e.g. about-us)
      - content_html: HTML body content (Use <h2>, <p>, <ul> tags. NO <html>, <head>, or <body> tags).
      - seo_meta_desc: SEO Meta description (150 chars max).
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [{ text: prompt }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              slug: { type: Type.STRING },
              content_html: { type: Type.STRING },
              seo_meta_desc: { type: Type.STRING }
            }
          }
        }
      });

      if (!response.text) return null;
      
      // Safety cleanup for markdown
      const jsonStr = response.text.replace(/```json|```/g, '').trim();
      const data = JSON.parse(jsonStr);
      
      return {
        page_key: def.key,
        ...data
      };
    } catch (error) {
      console.error(`Failed to generate page [${def.key}]:`, error);
      return null; // Return null so we can filter it out later without crashing the batch
    }
  };

  try {
    // Execute all requests in parallel
    const results = await Promise.all(PAGE_DEFINITIONS.map(def => generatePage(def)));
    
    // Filter out failures
    const successfulPages = results.filter((p): p is GeneratedPageContent => p !== null);
    
    if (successfulPages.length === 0) {
      throw new Error("AI failed to generate any pages. Please check API quota or try again.");
    }

    return successfulPages;

  } catch (error: any) {
    console.error("Core Page Batch Generation Failed:", error);
    throw new Error(error.message || "Failed to generate core pages.");
  }
};
