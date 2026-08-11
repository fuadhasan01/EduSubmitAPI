import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';

import { AuthApiService } from './auth-api.service';
import { AuthUser, JwtClaims } from './auth.models';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthState {
  private readonly authApi = inject(AuthApiService);

  private readonly tokenKey = 'edusubmit_access_token';

  private readonly _token = signal<string | null>(this.getStoredToken());
  private readonly _currentUser = signal<AuthUser | null>(this.getUserFromToken(this._token()));

  readonly token = this._token.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();

  readonly isAuthenticated = computed(() => this._token() !== null && this._currentUser() !== null);
  readonly role = computed(() => this._currentUser()?.role ?? null);

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.authApi.login(request).pipe(tap((response) => this.setSession(response.token)));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this._token.set(null);
    this._currentUser.set(null);
  }

  restoreSession(): Observable<void> {
    const token = this._token();

    if (!token) {
      return of(void 0);
    }

    if (this.isTokenExpired(token)) {
      this.logout();
      return of(void 0);
    }

    const user = this.getUserFromToken(token);

    if (!user) {
      this.logout();
      return of(void 0);
    }

    this._currentUser.set(user);

    return of(void 0);
  }

  getToken(): string | null {
    return this._token();
  }

  private setSession(token: string): void {
    localStorage.setItem(this.tokenKey, token);

    this._token.set(token);
    this._currentUser.set(this.getUserFromToken(token));
  }

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch {
      return null;
    }
  }

  private getUserFromToken(token: string | null): AuthUser | null {
    if (!token) {
      return null;
    }

    try {
      const claims = this.decodeToken(token);

      const id = this.getClaimString(
        claims.sub ??
          claims['nameid'] ??
          claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      );

      const email = this.getClaimString(
        claims.email ??
          claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      );

      const role = this.getRole(claims);

      if (!id || !email || !role) {
        return null;
      }

      return {
        id,
        email,
        role,
      };
    } catch {
      return null;
    }
  }

  private normalizeUser(user: AuthUser, token: string): AuthUser {
    const tokenUser = this.getUserFromToken(token);

    return {
      id: user?.id ?? tokenUser?.id ?? '',
      email: user?.email ?? tokenUser?.email ?? '',
      role: user?.role ?? tokenUser?.role ?? '',
    };
  }

  private decodeToken(token: string): JwtClaims {
    const parts = token.split('.');

    if (parts.length !== 3) {
      throw new Error('Invalid JWT format.');
    }

    const payload = parts[1];
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      '=',
    );

    return JSON.parse(atob(paddedPayload)) as JwtClaims;
  }

  private getClaimString(value: unknown): string | null {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }

    return null;
  }

  private getRole(claims: JwtClaims): string | null {
    const roleClaim =
      claims.role ?? claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (typeof roleClaim === 'string' && roleClaim.trim().length > 0) {
      return roleClaim;
    }

    if (Array.isArray(roleClaim)) {
      const role = roleClaim.find((value) => typeof value === 'string' && value.trim().length > 0);
      return role ?? null;
    }

    return null;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const claims = this.decodeToken(token);

      if (!claims.exp) {
        return false;
      }

      return claims.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
