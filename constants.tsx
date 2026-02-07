
import { HelperProfile, Nationality, Experience, JobPost } from './types';

export const MOCK_HELPERS: HelperProfile[] = [
  {
    id: '1',
    name: 'Maria Santos',
    age: 32,
    nationality: Nationality.FILIPINO,
    experience: Experience.FINISHED,
    salary: 4870,
    skills: ['Cooking', 'Childcare', 'Cleaning', 'Pet Care'],
    languages: ['English', 'Cantonese (Basic)'],
    imageUrl: 'https://picsum.photos/seed/maria/400/500',
    availability: '2024-05-15',
    description: 'I have 8 years of experience in Hong Kong, specializing in cooking Chinese and Western dishes. I love children and am very careful.'
  },
  {
    id: '2',
    name: 'Siti Aminah',
    age: 28,
    nationality: Nationality.INDONESIAN,
    experience: Experience.EX_HK,
    salary: 5000,
    skills: ['Cooking', 'Elderly Care', 'Cleaning'],
    languages: ['Cantonese (Fluent)', 'Indonesian'],
    imageUrl: 'https://picsum.photos/seed/siti/400/500',
    availability: 'Immediate',
    description: 'Worked in Hong Kong for 4 years, focusing on elderly care and household management. Fluent in Cantonese.'
  },
  {
    id: '3',
    name: 'Lwin Mar',
    age: 25,
    nationality: Nationality.MYANMAR,
    experience: Experience.NEW,
    salary: 4870,
    skills: ['Childcare', 'Cleaning', 'Laundry'],
    languages: ['English (Good)', 'Burmese'],
    imageUrl: 'https://picsum.photos/seed/lwin/400/500',
    availability: '2024-06-01',
    description: 'Hardworking and sincere. Worked in Singapore for 1 year, basic knowledge of housework.'
  },
  {
    id: '4',
    name: 'Analyn Reyes',
    age: 38,
    nationality: Nationality.FILIPINO,
    experience: Experience.FINISHED,
    salary: 5500,
    skills: ['Professional Cooking', 'Newborn Care', 'Nursing Experience'],
    languages: ['English (Fluent)'],
    imageUrl: 'https://picsum.photos/seed/analyn/400/500',
    availability: '2024-05-20',
    description: 'Nursing background, specialized in newborn care. Familiar with various Chinese and Western recipes.'
  }
];

export const MOCK_JOBS: JobPost[] = [
  {
    id: 'j1',
    title: 'Seeking Experienced Helper (Tseung Kwan O)',
    location: 'Tseung Kwan O',
    salary: 'HK$ 5,000 - 6,000',
    requirements: ['Cooking', 'Take care of 2 children'],
    postedAt: '2 hours ago',
    expiryDate: '',
    status: 'approved',
    description: 'We are a family of four, need an honest and responsible helper for housework and children pick-up.'
  },
  {
    id: 'j2',
    title: 'Experienced Cook Needed (Mid-Levels)',
    location: 'Mid-Levels',
    salary: 'HK$ 6,500+',
    requirements: ['Fluent in Chinese cooking', 'Pet care'],
    postedAt: '5 hours ago',
    expiryDate: '',
    status: 'approved',
    description: 'Employer has high standards for food quality, need independent management of household chores and dog walking.'
  }
];
