export type ResumeTemplate = 'classic-ats' | 'modern-professional' | 'minimal' | 'software-engineer';

export type ResumeStatus = 'draft' | 'published';

export type ApplicationStatus =
  | 'saved'
  | 'preparing'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export type WorkMode = 'remote' | 'hybrid' | 'onsite';

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';

export type ExperienceLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive';

export type ProfilePlatform = 'linkedin' | 'naukri' | 'indeed';

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  title?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
}

export interface ResumeContent {
  personalInfo: PersonalInfo;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: SkillItem[];
  projects: Project[];
  certifications: Certification[];
  achievements: string[];
  languages: Language[];
  volunteer: string[];
  customSections: { id: string; title: string; content: string }[];
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  template: ResumeTemplate;
  content: ResumeContent;
  ats_score: number | null;
  status: ResumeStatus;
  created_at: string;
  updated_at: string;
}

export interface ATSAnalysis {
  id: string;
  user_id: string;
  resume_id: string | null;
  job_title: string;
  company_name: string;
  job_description: string;
  overall_score: number;
  keyword_match_score: number;
  skills_match_score: number;
  experience_alignment_score: number;
  formatting_score: number;
  matching_keywords: string[];
  missing_keywords: string[];
  recommendations: string[];
  created_at: string;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  country: string;
  city: string;
  workMode: WorkMode;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  postedAt: string;
  sourceName: string;
  sourceUrl?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  skills: string[];
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  matchScore?: number;
  matchingSkills?: string[];
  missingSkills?: string[];
}

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  job_data: JobPosting;
  created_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  job_id: string;
  job_data: JobPosting;
  resume_id: string | null;
  cover_letter: string | null;
  status: ApplicationStatus;
  notes: string | null;
  source_url: string | null;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  industry: string;
  location: string;
  description: string;
  employeeCount?: string;
  openJobs: number;
  leadership: { name: string; role: string; profileUrl?: string }[];
  referralContacts: ReferralContact[];
}

export interface ReferralContact {
  id: string;
  name: string;
  role: string;
  company: string;
  profileUrl?: string;
  relevance: string;
  connectionStatus: 'none' | 'connected' | 'requested';
}

export interface ProfileOptimization {
  id: string;
  user_id: string;
  platform: ProfilePlatform;
  current_headline: string;
  suggested_headline: string;
  current_summary: string;
  suggested_summary: string;
  suggestions: { section: string; current: string; suggested: string; reason: string }[];
  completeness_score: number;
  created_at: string;
}

export interface DashboardStats {
  totalResumes: number;
  averageAtsScore: number;
  savedJobs: number;
  applicationsSubmitted: number;
  interviewProgress: number;
}
