import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../../core/services/api-client.service';
import {
  AssignTeacherRequest,
  EnrollStudentRequest,
  TeacherAssignment,
  StudentEnrollment,
} from '../../../../core/models/relationship.model';

@Injectable({
  providedIn: 'root',
})
export class RelationshipApiService {
  private readonly apiClient = inject(ApiClient);

  getTeachersByClass(classId: string): Observable<TeacherAssignment[]> {
    return this.apiClient.get<TeacherAssignment[]>(`classes/${classId}/teachers`);
  }

  getStudentsByClass(classId: string): Observable<StudentEnrollment[]> {
    return this.apiClient.get<StudentEnrollment[]>(`classes/${classId}/students`);
  }

  assignTeacher(subjectId: string, teacherId: string): Observable<void> {
    const request: AssignTeacherRequest = { teacherId };
    return this.apiClient.post<void>(`subjects/${subjectId}/teachers`, request);
  }

  enrollStudent(classId: string, studentId: string): Observable<void> {
    const request: EnrollStudentRequest = { studentId };
    return this.apiClient.post<void>(`subjects/${classId}/students`, request);
  }
}
