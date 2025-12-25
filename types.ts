
export enum UserRole {
  CANDIDATE = 'CANDIDATE',
  INTERVIEWER = 'INTERVIEWER'
}

export interface JobPosition {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string[];
}

export interface InterviewRecord {
  id: string;
  candidateName: string;
  positionId: string;
  startTime: number;
  duration: number; // in seconds
  messages: { role: 'user' | 'model'; text: string; timestamp: number }[];
  score: number; // 0 - 100
  analysis: string;
}

export interface CandidateProfile {
  name: string;
  email: string;
  resumeUrl?: string;
  resumeText?: string;
  appliedPositionId?: string;
}
