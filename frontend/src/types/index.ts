// User types
export interface User {
  _id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

// Task types
export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  tags: string[];
  boardId: string | Board;
  assignedTo: User[];
  createdBy: User;
  dueDate?: string;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
}

// Board types
export interface Board {
  _id: string;
  name: string;
  description: string;
  createdBy: User;
  members: User[];
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
}

// Column type for drag and drop
export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

// API Response types
export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  message?: string;
  data?: T;
  count?: number;
}

// Drag and Drop types
export interface DragEndEvent {
  active: {
    id: string;
    data: {
      current: {
        type: string;
        id: string;
      };
    };
  };
  over?: {
    id: string;
    data: {
      current: {
        type: string;
        id: string;
      };
    };
  };
}
