export enum SubmissionStatus {
  Submitted = 'Submitted',
  Late = 'Late',
  Graded = 'Graded',
  ReturnedForRevision = 'ReturnedForRevision'
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  fileUrl: string;
  submittedAt: string;
  status: string;
  marks: number | null;
  feedback: string | null;
  gradedAt: string | null;
}

export interface CreateSubmissionRequest {
  assignmentId: string;
  content: string;
  fileUrl: string;
}

export interface UpdateSubmissionRequest {
  submissionId: string;
  content: string;
  fileUrl: string;
}

export interface GradeSubmissionRequest {
  marks: number;
  feedback: string;
}

export interface ReturnSubmissionForRevisionRequest {
  feedback: string;
}