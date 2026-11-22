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

export interface ProjectMember {
  id?: string;
  userId: string;
  projectId: string;
  role: ProjectRole;
  user?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  members?: ProjectMember[];
  _count?: {
    tasks?: number;
    members?: number;
  };
}

export interface Attachment {
  id: string;
  fileName: string;
  fileKey: string;
  mimeType: string;
  size: number;
  taskId: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  projectId: string;
  assigneeId?: string | null;
  assignee?: Pick<User, 'id' | 'name' | 'email'> | null;
  attachments?: Attachment[];
  createdAt?: string;
}