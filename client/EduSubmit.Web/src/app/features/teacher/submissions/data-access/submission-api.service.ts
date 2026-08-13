import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../../core/services/api-client.service';
import { PaginatedResponse, PaginationParams } from '../../../../core/models/pagination.model';
import {
  GradeSubmissionRequest,
  ReturnSubmissionForRevisionRequest,
  Submission,
} from '../../../../core/models/submission.model';

@Injectable({
  providedIn: 'root',
})
export class SubmissionApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly endpoint = 'Submissions';

getSubmissionsByAssignment(
  assignmentId: string,
  params: PaginationParams,
): Observable<PaginatedResponse<Submission>> {
  return this.apiClient.get<PaginatedResponse<Submission>>(
    `${this.endpoint}/assignment/${assignmentId}`,
    {
      ...(params.pageNumber !== undefined && {
        pageNumber: params.pageNumber,
      }),
      ...(params.pageSize !== undefined && {
        pageSize: params.pageSize,
      }),
    },
  );
}

  getSubmission(id: string): Observable<Submission> {
    return this.apiClient.get<Submission>(`${this.endpoint}/${id}`);
  }

  gradeSubmission(id: string, request: GradeSubmissionRequest): Observable<void> {
    return this.apiClient.post<void>(`${this.endpoint}/${id}/grade`, request);
  }

  returnForRevision(
    id: string,
    request: ReturnSubmissionForRevisionRequest,
  ): Observable<void> {
    return this.apiClient.post<void>(`${this.endpoint}/${id}/return-for-revision`, request);
  }
}