export enum UserRole {
  Admin = 1,
  Teacher = 2,
  Student = 3,
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  isActive: boolean;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserListParams {
  pageNumber?: number;
  pageSize?: number;
}
