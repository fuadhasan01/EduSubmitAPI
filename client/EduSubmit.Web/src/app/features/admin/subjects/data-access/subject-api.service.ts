import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../../core/services/api-client.service';
import { CreateSubjectRequest, SubjectDto } from '../../../../core/models/subject.model';

@Injectable({
  providedIn: 'root',
})
export class SubjectApiService {
  private readonly apiClient = inject(ApiClient);

  getSubjectsByClass(classId: string): Observable<SubjectDto[]> {
    return this.apiClient.get<SubjectDto[]>(`Subjects/class/${classId}`);
  }

  createSubject(request: CreateSubjectRequest): Observable<SubjectDto> {
    return this.apiClient.post<SubjectDto>('Subjects', request);
  }
}