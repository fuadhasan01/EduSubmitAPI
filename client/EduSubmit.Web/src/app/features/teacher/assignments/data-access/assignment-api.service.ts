import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../../core/services/api-client.service';
import {
  Assignment,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
} from '../../../../core/models/assignment.model';
import { PaginatedResponse } from '../../../../core/models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class AssignmentApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly endpoint = 'Assignments';

  getTeacherAssignments(pageNumber = 1, pageSize = 10): Observable<PaginatedResponse<Assignment>> {
    return this.apiClient.get<PaginatedResponse<Assignment>>(
      `${this.endpoint}/teacher?PageNumber=${pageNumber}&PageSize=${pageSize}`,
    );
  }

  getAssignmentById(id: string): Observable<Assignment> {
    return this.apiClient.get<Assignment>(`${this.endpoint}/${id}`);
  }

  createAssignment(request: CreateAssignmentRequest): Observable<void> {
    return this.apiClient.post<void>(this.endpoint, request);
  }

  updateAssignment(id: string, request: UpdateAssignmentRequest): Observable<void> {
    return this.apiClient.put<void>(`${this.endpoint}/${id}`, request);
  }

  publishAssignment(id: string): Observable<void> {
    return this.apiClient.post<void>(`${this.endpoint}/${id}/publish`, {});
  }

  unpublishAssignment(id: string): Observable<void> {
    return this.apiClient.post<void>(`${this.endpoint}/${id}/unpublish`, {});
  }

  deleteAssignment(id: string): Observable<void> {
    return this.apiClient.delete<void>(`${this.endpoint}/${id}`);
  }
}