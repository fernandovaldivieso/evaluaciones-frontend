export interface Question {
  id: string;
  text: string;
  type: "multiple-choice" | "text";
  options?: string[];
  correctAnswer?: string;
}

export interface Evaluation {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number; // in minutes
  questions: Question[];
  createdAt: string;
  status: "active" | "draft" | "archived";
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Result {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  evaluationId: string;
  evaluationTitle: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  timeSpent: number; // in seconds
}

export interface ExamAnswer {
  questionId: string;
  answer: string;
}
