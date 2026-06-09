export interface JobSearchGuideline {
  generalStrategy: string;
  specificRoles: {
    role: string;
    advice: string;
  }[];
  contactTips: string;
  interviewTips: string;
}

export interface KeyMember {
  name: string;
  role: string;
  linkedin: string;
}

export interface Company {
  id: string;
  name: string;
  fundingAmount: string;
  fundingRound: string;
  date: string;
  industry: string;
  description: string;
  website: string;
  headquarters: string;
  investors: string;
  contactEmail: string;
  keyMembers: KeyMember[];
  pastJobs?: string[];
  futureJobs?: string[];
  jobSearchGuideline: JobSearchGuideline;
}

export interface UserProfile {
  email: string;
  targetRoles: string[];
  experienceLevel: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Any';
  skills: string[];
  locationPreference: string;
  industryPreference: string[];
  lastWeeklySent?: string;
}

export interface EmailSettings {
  provider: 'resend' | 'smtp' | 'sandbox';
  resendApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  fromEmail?: string;
}

export interface EmailLog {
  id: string;
  sentAt: string;
  recipient: string;
  status: 'success' | 'failed';
  errorMessage?: string;
  companiesCount: number;
  subject: string;
}
