
import { HelperProfile, Nationality, Experience, JobPost } from './types';

export const MOCK_HELPERS: HelperProfile[] = [
  {
    id: '1',
    name: 'Maria Santos',
    age: 32,
    nationality: Nationality.FILIPINO,
    experience: Experience.FINISHED,
    salary: 4870,
    skills: ['煮飯', '照顧小孩', '打掃', '照顧寵物'],
    languages: ['英語', '廣東話 (基礎)'],
    imageUrl: 'https://picsum.photos/seed/maria/400/500',
    availability: '2024-05-15',
    description: '我有8年在香港工作的經驗，擅長烹飪中餐及西餐。我非常喜歡小孩子，處事細心。'
  },
  {
    id: '2',
    name: 'Siti Aminah',
    age: 28,
    nationality: Nationality.INDONESIAN,
    experience: Experience.EX_HK,
    salary: 5000,
    skills: ['煮飯', '照顧老人', '打掃'],
    languages: ['廣東話 (流利)', '印尼語'],
    imageUrl: 'https://picsum.photos/seed/siti/400/500',
    availability: '隨時',
    description: '曾在香港工作4年，主攻照顧老人及家務管理。廣東話溝通無障礙。'
  },
  {
    id: '3',
    name: 'Lwin Mar',
    age: 25,
    nationality: Nationality.MYANMAR,
    experience: Experience.NEW,
    salary: 4870,
    skills: ['照顧小孩', '打掃', '洗熨'],
    languages: ['英語 (良好)', '緬甸語'],
    imageUrl: 'https://picsum.photos/seed/lwin/400/500',
    availability: '2024-06-01',
    description: '勤奮好學，態度誠懇。曾在新加坡工作過1年，對家務有基本認識。'
  },
  {
    id: '4',
    name: 'Analyn Reyes',
    age: 38,
    nationality: Nationality.FILIPINO,
    experience: Experience.FINISHED,
    salary: 5500,
    skills: ['專業烹飪', '照顧新生兒', '護理經驗'],
    languages: ['英語 (流利)'],
    imageUrl: 'https://picsum.photos/seed/analyn/400/500',
    availability: '2024-05-20',
    description: '擁有護理背景，特別擅長照顧剛出生的嬰兒。熟悉各類中西食譜。'
  }
];

export const MOCK_JOBS: JobPost[] = [
  {
    id: 'j1',
    title: '尋找有經驗女傭 (將軍澳)',
    location: '將軍澳',
    salary: 'HK$ 5,000 - 6,000',
    requirements: ['煮飯', '照顧2名小孩'],
    postedAt: '2小時前',
    description: '我們是一個四口之家，需要一名誠實、有責任感的女傭負責家務及接送小孩。'
  },
  {
    id: 'j2',
    title: '需要擅長煮食女傭 (半山區)',
    location: '中半山',
    salary: 'HK$ 6,500+',
    requirements: ['精通中餐', '照顧寵物'],
    postedAt: '5小時前',
    description: '僱主對食物質素有要求，需獨立管理大屋家務，另需遛狗。'
  }
];
