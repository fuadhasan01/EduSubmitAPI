import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../services/api-client.service';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { AuthUser } from './auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly apiClient = inject(ApiClient);

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.apiClient.post<LoginResponse>('Auth/login', request);
  }

  //   check(): Observable<AuthUser> {
  //     return this.apiClient.get<AuthUser>('Auth/check');
  //   }
}
