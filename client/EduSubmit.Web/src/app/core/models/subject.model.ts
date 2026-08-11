export interface SubjectDto {
  id: string;
  name: string;
  classId: string;
}

export interface CreateSubjectRequest {
  name: string;
  classId: string;
}