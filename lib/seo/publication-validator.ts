
import { PseoPageInstance } from '../types';

export interface ValidationResult {
  canPublish: boolean;
  errors: string[];
}

export const validatePublicationRequirements = (page: PseoPageInstance): ValidationResult => {
  const errors: string[] = [];

  // 1. Keyword Check
  if (!page.keywords || page.keywords.length === 0) {
    errors.push("At least 1 target keyword is required.");
  }

  // 2. Image Check
  // Images are stored in image_urls array
  if (!page.image_urls || page.image_urls.length < 2) {
    errors.push("At least 2 unique, location-relevant images are required.");
  }

  // 3. Hero Content Check
  const hero = page.unique_hero as any;
  if (!hero || !hero.headline || !hero.content || hero.content.length < 50) {
    errors.push("Hero section content (headline & body) is incomplete.");
  }

  // 4. Local Context Check
  const context = page.unique_local_context as any;
  if (!context || !context.content || context.content.length < 50) {
    errors.push("Local Context section is incomplete.");
  }

  return {
    canPublish: errors.length === 0,
    errors
  };
};
