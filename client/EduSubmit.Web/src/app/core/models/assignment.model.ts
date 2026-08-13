export enum AssignmentStatus {
  Draft = 'Draft',
  Published = 'Published',
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName?: string;
  classId: string;
  className?: string;
  teacherId: string;
  teacherName?: string;
  deadline: string;
  maxMarks: number;
  status: string;
  createdAt: string;
}

export interface CreateAssignmentRequest {
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  deadline: string;
  maxMarks: number;
  publishImmediately: boolean;
}

export interface UpdateAssignmentRequest {
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  deadline: string;
  maxMarks: number;
}
