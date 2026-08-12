import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Submission } from '../../../../core/models/submission.model';
import { PaginatedResponse } from '../../../../core/models/pagination.model';
import { ApiClient } from '../../../../core/services/api-client.service';

@Injectable({
  providedIn: 'root',
})
export class SubmissionApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly endpoint = 'Submissions';

  getSubmissions(pageNumber = 1, pageSize = 10): Observable<PaginatedResponse<Submission>> {
    return this.apiClient.get<PaginatedResponse<Submission>>(
      `${this.endpoint}?PageNumber=${pageNumber}&PageSize=${pageSize}`,
    );
  }

  getSubmissionById(id: string): Observable<Submission> {
    return this.apiClient.get<Submission>(`${this.endpoint}/${id}`);
  }
}