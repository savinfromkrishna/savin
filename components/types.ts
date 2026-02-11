
export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  tech: string[];
  year: string;
  outcome: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  company: string;
  description: string;
  tags: string[];
}

export interface JournalPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

export enum Page {
  HOME = 'home',
  ABOUT = 'about',
  WORKS = 'works',
  CASE_STUDY_1 = 'case_1',
  CASE_STUDY_2 = 'case_2',
  CASE_STUDY_3 = 'case_3',
  CASE_STUDY_4 = 'case_4',
  CASE_STUDY_5 = 'case_5',
  EXPERIENCE = 'experience',
  SERVICES = 'services',
  LAB = 'lab',
  TECH_STACK = 'stack',
  CLIENTS = 'clients',
  JOURNAL = 'journal',
  POST_1 = 'post_1',
  POST_2 = 'post_2',
  POST_3 = 'post_3',
  CONTACT = 'contact',
  FAQ = 'faq',
  PHILOSOPHY = 'philosophy',
  MENTORSHIP = 'mentorship',
  LEGAL = 'legal',
  RESUME = 'resume',
  NOW = 'now',
  PROJECT_DETAILS = "PROJECT_DETAILS"
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
