
export enum Nationality {
  FILIPINO = '菲律賓',
  INDONESIAN = '印尼',
  THAI = '泰國',
  MYANMAR = '緬甸',
  LOCAL = '本地'
}

export enum Experience {
  NEW = '新到港',
  FINISHED = '完約',
  EX_HK = '曾獲聘用',
  EX_ABROAD = '海外經驗'
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

export type ViewState = 'HOME' | 'SEARCH_HELPERS' | 'SEARCH_JOBS' | 'POST_JOB' | 'AI_MATCH' | 'ADMIN';
