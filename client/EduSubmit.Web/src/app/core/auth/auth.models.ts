export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface JwtClaims {
  sub?: string;
  email?: string;
  role?: string | string[];
  name?: string;
  exp?: number;
  iat?: number;
  nbf?: number;
  [key: string]: unknown;
}
