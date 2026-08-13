import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../../core/services/api-client.service';
import { PaginatedResponse } from '../../../../core/models/pagination.model';
import {
  CreateSubmissionRequest,
  Submission,
  UpdateSubmissionRequest,
} from '../../../../core/models/submission.model';

@Injectable({
  providedIn: 'root',
})
export class SubmissionApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly endpoint = 'Submissions';

  getMySubmissions(pageNumber = 1, pageSize = 10): Observable<PaginatedResponse<Submission>> {
    return this.apiClient.get<PaginatedResponse<Submission>>(
      `${this.endpoint}/student?PageNumber=${pageNumber}&PageSize=${pageSize}`,
    );
  }

  getSubmissionById(id: string): Observable<Submission> {
    return this.apiClient.get<Submission>(`${this.endpoint}/${id}`);
  }

  createSubmission(request: CreateSubmissionRequest): Observable<Submission> {
    return this.apiClient.post<Submission>(this.endpoint, request);
  }

  updateSubmission(id: string, request: UpdateSubmissionRequest): Observable<Submission> {
    return this.apiClient.put<Submission>(`${this.endpoint}/${id}`, request);
  }
}