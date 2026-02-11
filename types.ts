
export enum Nationality {
  FILIPINO = 'Filipino',
  INDONESIAN = 'Indonesian',
  THAI = 'Thai',
  MYANMAR = 'Myanmar',
  LOCAL = 'Local'
}

export enum Experience {
  NEW = 'New to HK',
  FINISHED = 'Finished Contract',
  EX_HK = 'Ex-HK',
  EX_ABROAD = 'Overseas Experience'
}

export enum WorkExperienceType {
  LOCAL_COMPLETED = 'Local - Completed Contract',
  LOCAL_TERMINATED = 'Local - Terminated Contract',
  OVERSEAS = 'Overseas Experience',
  NEW = 'New to Hong Kong'
}

export interface HelperProfile {
  id: string;
  userId?: string;
  name: string;
  age: number;
  nationality: Nationality;
  experience: Experience;
  yearsInHK?: number;
  workExperienceType?: WorkExperienceType;
  salary: number;
  skills: string[];
  languages: string[];
  imageUrl: string;
  availability: string;
  description: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface JobPost {
  id: string;
  title: string;
  location: string;
  salary: string;
  requirements: string[];
  postedAt: string;
  expiryDate: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
}

export type ViewState = 'HOME' | 'SEARCH_HELPERS' | 'SEARCH_JOBS' | 'POST_JOB' | 'AI_MATCH' | 'ADMIN' | 'PAYMENT_SUCCESS' | 'HELPER_PROFILE';
