export const MIN_LISTING_DESCRIPTION_WORDS = 50;

export function countWords(text: string) {
  const normalized = text.trim();
  return normalized ? normalized.split(/\s+/).length : 0;
}

export function listingDescriptionError(lessonDescription: string, aboutTutor: string) {
  if (countWords(lessonDescription) < MIN_LISTING_DESCRIPTION_WORDS) {
    return `Ders açıklaması en az ${MIN_LISTING_DESCRIPTION_WORDS} kelime olmalıdır`;
  }
  if (countWords(aboutTutor) < MIN_LISTING_DESCRIPTION_WORDS) {
    return `Hakkınızda açıklaması en az ${MIN_LISTING_DESCRIPTION_WORDS} kelime olmalıdır`;
  }
  return null;
}
