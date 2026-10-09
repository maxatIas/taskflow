import axios from 'axios';
import {
  User,
  Board,
  Task,
  TaskStatus,
  TaskPriority,
  LoginFormData,
  RegisterFormData,
  ApiResponse
} from '../types';

// Create axios instance
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

// Request interceptor to add token to headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
 export const AuthApi = {
  // Register a new user
  register: async (data: RegisterFormData): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await API.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (data: LoginFormData): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await API.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await API.post<ApiResponse<null>>('/auth/logout');
    return response.data;
  },

  // Get current user
  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await API.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data;
  }
};

// Board API
export const BoardApi = {
  // Get all boards
  getAll: async (): Promise<ApiResponse<{ boards: Board[] }>> => {
    const response = await API.get<ApiResponse<{ boards: Board[] }>>('/boards');
    return response.data;
  },

  // Get single board with tasks
  getOne: async (id: string): Promise<ApiResponse<{ board: Board; tasks: Task[] }>> => {
    const response = await API.get<ApiResponse<{ board: Board; tasks: Task[] }>>(`/boards/${id}`);
    return response.data;
  },

  // Create a new board
  create: async (data: { name: string; description?: string }): Promise<ApiResponse<{ board: Board }>> => {
    const response = await API.post<ApiResponse<{ board: Board }>>('/boards', data);
    return response.data;
  },

  // Update board
  update: async (id: string, data: { name?: string; description?: string }): Promise<ApiResponse<{ board: Board }>> => {
    const response = await API.put<ApiResponse<{ board: Board }>>(`/boards/${id}`, data);
    return response.data;
  },

  // Delete board
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await API.delete<ApiResponse<null>>(`/boards/${id}`);
    return response.data;
  },

  // Add member to board
  addMember: async (boardId: string, userId: string): Promise<ApiResponse<{ board: Board }>> => {
    const response = await API.post<ApiResponse<{ board: Board }>>(`/boards/${boardId}/members`, { userId });
    return response.data;
  },

  // Remove member from board
  removeMember: async (boardId: string, memberId: string): Promise<ApiResponse<{ board: Board }>> => {
    const response = await API.delete<ApiResponse<{ board: Board }>>(`/boards/${boardId}/members/${memberId}`);
    return response.data;
  }
};

// Task API
export const TaskApi = {
  // Get all tasks for a board
  getByBoard: async (boardId: string): Promise<ApiResponse<{ tasks: Task[] }>> => {
    const response = await API.get<ApiResponse<{ tasks: Task[] }>>(`/tasks/board/${boardId}`);
    return response.data;
  },

  // Get single task
  getOne: async (id: string): Promise<ApiResponse<{ task: Task }>> => {
    const response = await API.get<ApiResponse<{ task: Task }>>(`/tasks/${id}`);
    return response.data;
  },

  // Create a new task
  create: async (
    boardId: string,
    data: {
      title: string;
      description?: string;
      tags?: string[];
      assignedTo?: string[];
      dueDate?: Date;
      priority?: TaskPriority;
    }
  ): Promise<ApiResponse<{ task: Task }>> => {
    const response = await API.post<ApiResponse<{ task: Task }>>(`/tasks/board/${boardId}`, data);
    return response.data;
  },

  // Update task
  update: async (
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      tags?: string[];
      assignedTo?: string[];
      dueDate?: Date;
      priority?: TaskPriority;
    }
  ): Promise<ApiResponse<{ task: Task }>> => {
    const response = await API.put<ApiResponse<{ task: Task }>>(`/tasks/${id}`, data);
    return response.data;
  },

  // Update task status (for drag and drop)
  updateStatus: async (id: string, status: TaskStatus): Promise<ApiResponse<{ task: Task }>> => {
    const response = await API.patch<ApiResponse<{ task: Task }>>(`/tasks/${id}/status`, { status });
    return response.data;
  },

  // Delete task
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await API.delete<ApiResponse<null>>(`/tasks/${id}`);
    return response.data;
  }
};

// User API
export const UserApi = {
  // Get all users (for member search)
  getAll: async (): Promise<ApiResponse<{ users: User[] }>> => {
    const response = await API.get<ApiResponse<{ users: User[] }>>('/users');
    return response.data;
  },

  // Get user by ID
  getById: async (id: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await API.get<ApiResponse<{ user: User }>>(`/users/${id}`);
    return response.data;
  }
};

export default API;
