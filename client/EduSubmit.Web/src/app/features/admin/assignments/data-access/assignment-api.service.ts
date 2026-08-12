import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../../core/services/api-client.service';
import { Assignment } from '../../../../core/models/assignment.model';
import { PaginatedResponse } from '../../../../core/models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class AssignmentApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly endpoint = 'Assignments';

  getAssignments(pageNumber = 1, pageSize = 10): Observable<PaginatedResponse<Assignment>> {
    return this.apiClient.get<PaginatedResponse<Assignment>>(
      `${this.endpoint}?PageNumber=${pageNumber}&PageSize=${pageSize}`,
    );
  }

  getAssignmentById(id: string): Observable<Assignment> {
    return this.apiClient.get<Assignment>(`${this.endpoint}/${id}`);
  }
}