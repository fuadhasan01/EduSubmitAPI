import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Observable<T> {
    return this.http.get<T>(this.buildUrl(endpoint), {
      params: this.buildParams(params)
    });
  }

  post<T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean>): Observable<T> {
    return this.http.post<T>(this.buildUrl(endpoint), body, {
      params: this.buildParams(params)
    });
  }

  put<T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean>): Observable<T> {
    return this.http.put<T>(this.buildUrl(endpoint), body, {
      params: this.buildParams(params)
    });
  }

  patch<T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean>): Observable<T> {
    return this.http.patch<T>(this.buildUrl(endpoint), body, {
      params: this.buildParams(params)
    });
  }

  delete<T>(endpoint: string, params?: Record<string, string | number | boolean>): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint), {
      params: this.buildParams(params)
    });
  }

  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;
  }

  private buildParams(params?: Record<string, string | number | boolean>): HttpParams {
    let httpParams = new HttpParams();

    if (!params) {
      return httpParams;
    }

    Object.entries(params).forEach(([key, value]) => {
      httpParams = httpParams.set(key, String(value));
    });

    return httpParams;
  }
}