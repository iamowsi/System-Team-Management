export type SystemRole = 'ADMIN' | 'USER';
export type ProjectRole = 'MANAGER' | 'MEMBER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface User {
  id: string;
  name: string;
  email: string;
  systemRole: SystemRole;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}