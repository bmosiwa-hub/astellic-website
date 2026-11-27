/**
 * HP-Hub reference data and display labels.
 *
 * The theme and document-type lists are only the *initial seed* — once seeded
 * they live in the database and are managed in the admin portal.
 */

export const HP_HUB_NAME = "Health Policy Intelligence Hub";
export const HP_HUB_SHORT = "HP-Hub";
export const HP_HUB_TAGLINE = "Evidence. Policy. Knowledge. Access.";
export const HP_HUB_BASE_URL = "https://www.astellic.com";

export const PAGE_SIZE = 20;

export const SEED_THEMES = [
  "Health Systems Strengthening",
  "Health Financing",
  "Health Governance",
  "Human Resources for Health",
  "Primary Health Care",
  "Health Information Systems",
  "Digital Health",
  "HIV/AIDS",
  "Tuberculosis",
  "Malaria",
  "Sexual and Reproductive Health",
  "Maternal and Newborn Health",
  "Child Health",
  "Adolescent Health",
  "Noncommunicable Diseases",
  "Mental Health",
  "Immunization",
  "Pharmaceuticals and Supply Chain",
  "Health Security and Emergency Preparedness",
  "Climate and Health",
  "Nutrition",
] as const;

export const SEED_DOCUMENT_TYPES = [
  "Policy",
  "Strategy",
  "Strategic Plan",
  "Framework",
  "Guidelines",
  "Clinical Guidelines",
  "Protocol",
  "Standard Operating Procedure",
  "Legislation",
  "Act",
  "Regulation",
  "Annual Report",
  "Programme Report",
  "Evaluation",
  "Assessment",
  "Survey",
  "Research Report",
  "Working Paper",
  "Technical Report",
  "Financing Report",
  "Budget",
  "Review",
  "Fact Sheet",
  "Other",
] as const;

/** Countries the architecture anticipates. Only Malawi is live at launch. */
export const SEED_COUNTRIES = [
  {
    slug: "malawi",
    name: "Malawi",
    isoCode: "MW",
    isActive: true,
    sortOrder: 1,
    intro:
      "Health policies, strategies, guidelines, reports, evaluations and research from Malawi's health sector, catalogued with their source and rights information.",
  },
  { slug: "kenya", name: "Kenya", isoCode: "KE", isActive: false, sortOrder: 2, intro: null },
  { slug: "zambia", name: "Zambia", isoCode: "ZM", isActive: false, sortOrder: 3, intro: null },
  { slug: "uganda", name: "Uganda", isoCode: "UG", isActive: false, sortOrder: 4, intro: null },
  { slug: "nigeria", name: "Nigeria", isoCode: "NG", isActive: false, sortOrder: 5, intro: null },
] as const;

// ── Enum labels ───────────────────────────────────────────────────────────────

export const ACCESS_LABELS = {
  HOSTED: "Hosted download",
  EXTERNAL: "External source",
  RESTRICTED: "Restricted access",
} as const;

export const ACCESS_DESCRIPTIONS = {
  HOSTED: "Astellic hosts this file with the rights holder's permission or under an open licence.",
  EXTERNAL: "This record links to the publisher's own copy. Astellic does not host the file.",
  RESTRICTED: "This document is not publicly available. You can request access below.",
} as const;

export const STATUS_LABELS = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending review",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
} as const;

export const VERIFICATION_LABELS = {
  UNVERIFIED: "Unverified",
  PENDING_VERIFICATION: "Verification pending",
  VERIFIED: "Verified",
  DISPUTED: "Disputed",
} as const;

export const PERMISSION_LABELS = {
  UNKNOWN: "Unknown",
  NOT_REQUIRED: "Not required (metadata only)",
  REQUESTED: "Permission requested",
  GRANTED: "Permission granted",
  OPEN_LICENSE: "Open licence",
  DENIED: "Permission denied",
} as const;

export const ACQUISITION_LABELS = {
  ACQUIRED: "Acquired",
  MISSING: "Missing",
  NEEDS_VERIFICATION: "Needs verification",
  BROKEN_LINK: "Broken source link",
  PERMISSION_REQUIRED: "Permission required",
  NEEDS_UPDATING: "Needs updating",
} as const;

export const SUBMISSION_LABELS = {
  NEW: "New",
  IN_REVIEW: "In review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  DUPLICATE: "Duplicate",
} as const;

export const FEEDBACK_LABELS = {
  CORRECTION: "Correction",
  BROKEN_LINK: "Broken link",
  TAKEDOWN: "Takedown request",
  ACCESS_REQUEST: "Access request",
  OTHER: "Other",
} as const;

export const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  REPO_ADMIN: "Repository Administrator",
  EDITOR: "Editor / Reviewer",
  CONTRIBUTOR: "Contributor",
} as const;

export const RECIPIENT_LABELS = {
  MINISTRY: "Ministry",
  GOVERNMENT_INSTITUTION: "Government institution",
  RESEARCHER: "Researcher",
  UNIVERSITY: "University",
  NGO: "NGO",
  DONOR: "Donor",
  IMPLEMENTING_PARTNER: "Implementing partner",
  OTHER: "Other",
} as const;

export const OUTREACH_LABELS = {
  DRAFT: "Draft",
  SENT: "Sent",
  AWAITING_RESPONSE: "Awaiting response",
  RESPONDED: "Responded",
  DOCUMENT_RECEIVED: "Document received",
  DECLINED: "Declined",
  NO_RESPONSE: "No response",
} as const;

/** Permission statuses under which Astellic may host and serve a file. */
export const HOSTABLE_PERMISSIONS = ["GRANTED", "OPEN_LICENSE"] as const;
