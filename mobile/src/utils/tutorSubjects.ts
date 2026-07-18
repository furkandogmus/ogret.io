import type { SubjectInfo, TutorListing } from "../types";

export function getTutorSubjects(listings: TutorListing[], embeddedSubjects: SubjectInfo[] = []) {
  const activeListings = listings.filter((listing) => !listing.status || listing.status === "ACTIVE");
  const uniqueSubjects = new Map<string, SubjectInfo>();

  activeListings.forEach((listing) => {
    if (listing.subjectId && listing.subjectName) {
      uniqueSubjects.set(listing.subjectId, { id: listing.subjectId, name: listing.subjectName });
    }
  });

  return uniqueSubjects.size > 0 ? [...uniqueSubjects.values()] : embeddedSubjects;
}
