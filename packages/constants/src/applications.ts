export const APPLICATION_STATUSES = [
  "saved",
  "applied",
  "in_progress",
  "offered",
  "accepted",
  "rejected",
  "withdrawn",
  "ghosted",
] as const;

export const STAGE_TYPES = [
  "screening",
  "skills_test",
  "technical_skills",
  "behavioral",
  "presentation",
  "final_round",
  "other",
] as const;

export const STAGE_STATUSES = [
  "pending",
  "scheduled",
  "completed",
  "passed",
  "failed",
] as const;

export const SOURCE_CATEGORIES = [
  "job_board",
  "company_website",
  "referral",
  "recruiter_outreach",
  "other",
] as const;

export const JOB_TYPES = [
  "full_time",
  "part_time",
  "contract",
  "internship",
  "freelance",
  "other",
] as const;

export const WORKPLACE_TYPES = ["remote", "hybrid", "onsite"] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export type StageStatus = (typeof STAGE_STATUSES)[number];
export type StageType = (typeof STAGE_TYPES)[number];
export type JobType = (typeof JOB_TYPES)[number];
export type WorkplaceType = (typeof WORKPLACE_TYPES)[number];
export type SourceCategory = (typeof SOURCE_CATEGORIES)[number];
