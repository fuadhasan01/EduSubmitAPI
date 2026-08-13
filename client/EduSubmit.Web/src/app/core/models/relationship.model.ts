export interface AssignTeacherRequest {
  teacherId: string;
}

export interface EnrollStudentRequest {
  studentId: string;
}

export interface TeacherAssignment {
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
}

export interface StudentEnrollment {
  studentId: string;
  studentName: string;
  classId: string;
}
