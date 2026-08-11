import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../../core/services/api-client.service';
import { ClassDto, CreateClassRequest } from '../../../../core/models/class.model';
@Injectable({
  providedIn: 'root',
})
export class ClassApiService {
  private readonly apiClient = inject(ApiClient);
  private readonly endpoint = 'Classes';

  getClasses(): Observable<ClassDto[]> {
    return this.apiClient.get<ClassDto[]>(this.endpoint);
  }

  createClass(request: CreateClassRequest): Observable<ClassDto> {
    return this.apiClient.post<ClassDto>(this.endpoint, request);
  }
}
