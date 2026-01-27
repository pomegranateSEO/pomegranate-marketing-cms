export const SEO_LIMITS = {
  TITLE_MAX: 90,
  DESC_MAX: 160,
};

export const validateTitle = (title: string): { isValid: boolean; message?: string } => {
  if (title.length > SEO_LIMITS.TITLE_MAX) {
    return { isValid: false, message: `Title exceeds ${SEO_LIMITS.TITLE_MAX} characters.` };
  }
  return { isValid: true };
};

export const validateDescription = (description: string): { isValid: boolean; message?: string } => {
  if (description.length > SEO_LIMITS.DESC_MAX) {
    return { isValid: false, message: `Description exceeds ${SEO_LIMITS.DESC_MAX} characters.` };
  }
  return { isValid: true };
};

export const getCharacterCountColor = (current: number, max: number) => {
  const percentage = current / max;
  if (current > max) return "text-red-500 font-bold";
  if (percentage > 0.9) return "text-orange-500";
  return "text-gray-500";
};
