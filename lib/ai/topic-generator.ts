
import { GoogleGenAI } from "@google/genai";
import type { Business, Service, TargetLocation, KnowledgeEntity, Industry, BlogTopic } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GenerationContext {
  business: Business;
  services: Service[];
  locations: TargetLocation[];
  entities: KnowledgeEntity[];
  industries: Industry[];
  existingTopics?: BlogTopic[];
}

// --- CORE ROADMAP GENERATION (Already Existing) ---
export const generateTopicRoadmap = async (ctx: GenerationContext, instructions?: string): Promise<any> => {
  const { business, services, locations, entities, industries } = ctx;

  const prompt = `
    SYSTEM ROLE: You are a Senior Semantic SEO Strategist and Knowledge Graph Architect.
    TASK: Generate a hierarchical blog topic roadmap for the provided business.
    
    STRATEGY:
    1. **Wide & Narrow Approach**: Generate a mix of "Really Wide" niche topics (e.g., "SEO Training", "Digital Education") AND "Super Narrow" topics (e.g., "Local SEO Dominance in London", "Technical Audit for Law Firms"). 
    2. **Hierarchy**: The wide topics should act as pillars/parents. The narrow topics should be children/clusters.
    3. **Recursive Depth**: We want to be able to drill down. Ensure broad topics have specific sub-topics.
    
    USER INSTRUCTIONS / FEEDBACK:
    ${instructions ? `"${instructions}"\n(CRITICAL: Adhere strictly to these user instructions)` : "None provided."}
    
    CRITICAL RULES:
    1. **Knowledge Graph Linking**: Every topic MUST be linked to a primary entity.
       - If you use an entity from the INPUT list, use its UUID in 'primary_entity_id'.
       - If you suggest a NEW entity (in 'missing_entities'), provide its name in 'primary_entity_name' within the topic object.
    2. **Semantic Triangulation**: Combine Service x Industry x Entity.
    3. **PSEO Readiness**: Flag topics that can be templated.
    4. **Speakable Hints**: Include 3-5 short phrases for voice search.
    
    INPUT DATA:
    Business: ${business.name} - ${business.description}
    Services: ${services.map(s => `${s.id}:${s.name}`).join(', ')}
    Entities: ${entities.map(e => `${e.id}:${e.name} (${e.entity_type})`).join(', ')}
    Industries: ${industries.map(i => `${i.id}:${i.name}`).join(', ')}
    
    OUTPUT FORMAT (JSON ONLY): 
    {
      "topical_authority_roadmap": {
        "topics": [
          {
            "name": "Topic Title",
            "slug": "url-slug",
            "description": "Brief strategy description",
            "topic_type": "pillar" | "cluster" | "micro-topic",
            "primary_entity_id": "UUID (if existing)",
            "primary_entity_name": "Name (if new/missing)",
            "content_intent": "informational" | "commercial",
            "seo_notes": "Strategy notes",
            "speakable_hints": ["hint 1", "hint 2"],
            "children": [ ... recursive topics ... ]
          }
        ],
        "missing_entities": [
          {
            "suggested_name": "Entity Name",
            "entity_type": "Type",
            "rationale": "Why it is needed"
          }
        ]
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: { parts: [{ text: prompt }] },
      config: { responseMimeType: "application/json" }
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text.replace(/```json|```/g, '').trim());

  } catch (e: any) {
    console.error("Topic Generation Failed:", e);
    throw new Error(e.message || "Failed to generate topic roadmap");
  }
};

// --- NEW: GENERATE SUB-TOPICS ---
export const generateSubTopics = async (
  parentTopic: BlogTopic,
  ctx: GenerationContext
): Promise<any[]> => {
  const { business, services, entities } = ctx;

  const prompt = `
    SYSTEM ROLE: You are a Semantic SEO Specialist.
    TASK: Generate 3-5 sub-topics (clusters or micro-topics) for the parent topic: "${parentTopic.name}".
    
    CONTEXT:
    Parent Topic: ${parentTopic.name} - ${parentTopic.description}
    Business: ${business.name}
    Available Services: ${services.map(s => s.name).join(', ')}
    
    GOAL:
    Create narrower, specific content ideas that support the parent topic.
    Examples: If parent is "SEO Services", children could be "Local SEO for Dentists", "Technical Audits", etc.
    
    OUTPUT FORMAT (JSON ARRAY):
    [
      {
        "name": "Subtopic Title",
        "description": "...",
        "topic_type": "cluster" | "micro-topic",
        "content_intent": "informational" | "commercial",
        "primary_entity_name": "Entity Name (Optional)"
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: { parts: [{ text: prompt }] },
      config: { responseMimeType: "application/json" }
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text.replace(/```json|```/g, '').trim());
  } catch (e: any) {
    console.error("Subtopic Gen Failed:", e);
    throw new Error("Failed to generate subtopics");
  }
};

// --- NEW: GENERATE PARENT TOPIC ---
export const generateParentTopic = async (
  childTopic: BlogTopic,
  ctx: GenerationContext
): Promise<any> => {
  const { business } = ctx;

  const prompt = `
    SYSTEM ROLE: You are a Content Strategist.
    TASK: Create a SINGLE "Wider" or "Broader" parent topic that encompasses the current topic: "${childTopic.name}".
    
    CONTEXT:
    Child Topic: ${childTopic.name} - ${childTopic.description}
    Business: ${business.name}
    
    GOAL:
    Create a Pillar/Parent category.
    Example: If child is "Brixton SEO", parent should be "South London SEO" or "London Local Marketing".
    
    OUTPUT FORMAT (JSON OBJECT):
    {
      "name": "Parent Topic Title",
      "description": "...",
      "topic_type": "pillar" | "cluster",
      "content_intent": "informational" | "commercial"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: { parts: [{ text: prompt }] },
      config: { responseMimeType: "application/json" }
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text.replace(/```json|```/g, '').trim());
  } catch (e: any) {
    console.error("Parent Gen Failed:", e);
    throw new Error("Failed to generate parent topic");
  }
};

// --- NEW: REFINE ROADMAP (Structural Correction) ---
export const refineRoadmapStructure = async (
  currentTopics: BlogTopic[],
  instructions: string,
  ctx: GenerationContext
): Promise<any> => {
  // Simplify topic structure for token efficiency
  const simplifiedTree = currentTopics.map(t => ({
    id: t.id,
    name: t.name,
    parent_id: t.parent_topic_id,
    type: t.topic_type
  }));

  const prompt = `
    SYSTEM ROLE: You are a Knowledge Graph Editor.
    TASK: Refine the existing topic tree based on User Feedback.
    
    USER FEEDBACK: "${instructions}"
    (e.g., "Brixton is SW London not East", "Move X to Y", "Rename Z")
    
    CURRENT STRUCTURE (Flat List):
    ${JSON.stringify(simplifiedTree)}
    
    INSTRUCTIONS:
    1. Return a JSON object containing a list of **modifications**.
    2. Supported actions: 
       - "move": change parent_id of a topic.
       - "rename": change name of a topic.
       - "delete": remove a topic.
       - "create": add a new topic (parent or child).
    3. Be specific. If moving, provide the correct new parent ID (or create one).
    
    OUTPUT FORMAT:
    {
      "actions": [
        { "type": "move", "topic_id": "...", "new_parent_id": "..." },
        { "type": "rename", "topic_id": "...", "new_name": "..." },
        { "type": "delete", "topic_id": "..." },
        { "type": "create", "name": "...", "type": "pillar", "parent_id": "..." } 
      ]
    }
    
    **IMPORTANT**: If the user says "Brixton is in SW London", and "SW London" doesn't exist, you MUST "create" the "South West London" topic first, then "move" Brixton to it.
  `;

  // Note: This function is a bit experimental. 
  // A safer approach for V2 is to just Regenerate the whole tree with the feedback as context (which generateTopicRoadmap does).
  // But if we want to preserve IDs, we need something like this. 
  // For this implementation, let's stick to the "Regenerate with Instructions" flow in the UI as the primary "Refine", 
  // but keep this if we want fine-grained control later. 
  
  // Actually, let's fallback to "Regenerate" for the MVP of this feature 
  // because diffing trees reliably with AI is error-prone without a complex diff engine.
  // We will use generateTopicRoadmap with the 'instructions' parameter.
  return null; 
};
