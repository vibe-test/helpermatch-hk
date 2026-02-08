
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

export interface HelperProfile {
  id: string;
  name: string;
  age: number;
  nationality: Nationality;
  experience: Experience;
  salary: number;
  skills: string[];
  languages: string[];
  imageUrl: string;
  availability: string;
  description: string;
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

export type ViewState = 'HOME' | 'SEARCH_HELPERS' | 'SEARCH_JOBS' | 'POST_JOB' | 'AI_MATCH' | 'ADMIN' | 'PAYMENT_SUCCESS';
