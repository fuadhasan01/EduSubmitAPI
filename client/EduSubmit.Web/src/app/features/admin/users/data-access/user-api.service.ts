import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../../../../core/models/pagination.model';
import { CreateUserRequest, User } from '../../../../core/models/user.model';
import { ApiClient } from '../../../../core/services/api-client.service';
@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly endpoint = 'users';

  getUsers(pageNumber: number, pageSize: number): Observable<PaginatedResponse<User>> {
    return this.apiClient.get<PaginatedResponse<User>>(this.endpoint, {
      PageNumber: pageNumber,
      PageSize: pageSize,
    });
  }

  createUser(request: CreateUserRequest): Observable<User> {
    return this.apiClient.post<User>(this.endpoint, request);
  }

  deactivateUser(id: string): Observable<void> {
    return this.apiClient.delete<void>(`${this.endpoint}/${id}`);
  }
}
