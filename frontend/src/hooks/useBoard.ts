import { useState, useEffect, useCallback } from 'react';
import { Board, Task, TaskStatus, ApiResponse } from '../types';
import { BoardApi, TaskApi } from '../services/api';
import { useAuth } from './useAuth';

// Organize tasks by status into columns
export const organizeTasksByStatus = (tasks: Task[]): Record<TaskStatus, Task[]> => {
  const columns: Record<TaskStatus, Task[]> = {
    'todo': [],
    'in-progress': [],
    'done': []
  };

  tasks.forEach(task => {
    columns[task.status].push(task);
  });

  return columns;
};

// Custom hook for board operations
export const useBoard = (boardId?: string) => {
  const { token, isAuthenticated } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Record<TaskStatus, Task[]>>({
    'todo': [],
    'in-progress': [],
    'done': []
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all boards
  const fetchBoards = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await BoardApi.getAll();
      
      if (response.status === 'success' && response.data?.boards) {
        setBoards(response.data.boards);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch boards');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch single board with tasks
  const fetchBoard = useCallback(async (id: string) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await BoardApi.getOne(id);
      
      if (response.status === 'success' && response.data) {
        setCurrentBoard(response.data.board);
        setTasks(response.data.tasks);
        setColumns(organizeTasksByStatus(response.data.tasks));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch board');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Create a new board
  const createBoard = async (name: string, description?: string): Promise<Board | null> => {
    if (!isAuthenticated) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await BoardApi.create({ name, description });
      
      if (response.status === 'success' && response.data?.board) {
        // Add new board to boards list
        setBoards(prev => [...prev, response.data.board]);
        return response.data.board;
      }
      return null;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create board');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update board
  const updateBoard = async (id: string, data: { name?: string; description?: string }): Promise<Board | null> => {
    if (!isAuthenticated) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await BoardApi.update(id, data);
      
      if (response.status === 'success' && response.data?.board) {
        // Update board in boards list
        setBoards(prev => 
          prev.map(board => 
            board._id === id ? response.data.board : board
          )
        );
        
        // Update current board if it's the one being edited
        if (currentBoard?._id === id) {
          setCurrentBoard(response.data.board);
        }
        
        return response.data.board;
      }
      return null;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update board');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete board
  const deleteBoard = async (id: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await BoardApi.delete(id);
      
      if (response.status === 'success') {
        // Remove board from boards list
        setBoards(prev => prev.filter(board => board._id !== id));
        
        // Clear current board if it's the one being deleted
        if (currentBoard?._id === id) {
          setCurrentBoard(null);
          setTasks([]);
          setColumns({
            'todo': [],
            'in-progress': [],
            'done': []
          });
        }
        
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete board');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Add member to board
  const addMember = async (boardId: string, userId: string): Promise<Board | null> => {
    if (!isAuthenticated) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await BoardApi.addMember(boardId, userId);
      
      if (response.status === 'success' && response.data?.board) {
        // Update board in boards list
        setBoards(prev => 
          prev.map(board => 
            board._id === boardId ? response.data.board : board
          )
        );
        
        // Update current board if it's the one being edited
        if (currentBoard?._id === boardId) {
          setCurrentBoard(response.data.board);
        }
        
        return response.data.board;
      }
      return null;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add member');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Remove member from board
  const removeMember = async (boardId: string, memberId: string): Promise<Board | null> => {
    if (!isAuthenticated) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await BoardApi.removeMember(boardId, memberId);
      
      if (response.status === 'success' && response.data?.board) {
        // Update board in boards list
        setBoards(prev => 
          prev.map(board => 
            board._id === boardId ? response.data.board : board
          )
        );
        
        // Update current board if it's the one being edited
        if (currentBoard?._id === boardId) {
          setCurrentBoard(response.data.board);
        }
        
        return response.data.board;
      }
      return null;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove member');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new task
  const createTask = async (
    boardId: string,
    taskData: {
      title: string;
      description?: string;
      tags?: string[];
      assignedTo?: string[];
      dueDate?: Date;
      priority?: 'low' | 'medium' | 'high';
    }
  ): Promise<Task | null> => {
    if (!isAuthenticated) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await TaskApi.create(boardId, taskData);
      
      if (response.status === 'success' && response.data?.task) {
        const newTask = response.data.task;
        
        // Add task to tasks list
        setTasks(prev => [...prev, newTask]);
        
        // Update columns
        setColumns(prev => ({
          ...prev,
          [newTask.status]: [...prev[newTask.status], newTask]
        }));
        
        return newTask;
      }
      return null;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update task
  const updateTask = async (
    taskId: string,
    updates: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      tags?: string[];
      assignedTo?: string[];
      dueDate?: Date;
      priority?: 'low' | 'medium' | 'high';
    }
  ): Promise<Task | null> => {
    if (!isAuthenticated) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await TaskApi.update(taskId, updates);
      
      if (response.status === 'success' && response.data?.task) {
        const updatedTask = response.data.task;
        
        // Update task in tasks list
        setTasks(prev => 
          prev.map(task => task._id === taskId ? updatedTask : task)
        );
        
        // Update columns - need to reorganize
        const newTasks = tasks.map(task => 
          task._id === taskId ? updatedTask : task
        );
        setColumns(organizeTasksByStatus(newTasks));
        
        return updatedTask;
      }
      return null;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update task status (for drag and drop)
  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus): Promise<Task | null> => {
    if (!isAuthenticated) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await TaskApi.updateStatus(taskId, newStatus);
      
      if (response.status === 'success' && response.data?.task) {
        const updatedTask = response.data.task;
        
        // Update task in tasks list
        setTasks(prev => 
          prev.map(task => task._id === taskId ? updatedTask : task)
        );
        
        // Update columns
        const newTasks = tasks.map(task => 
          task._id === taskId ? updatedTask : task
        );
        setColumns(organizeTasksByStatus(newTasks));
        
        return updatedTask;
      }
      return null;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task status');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const deleteTask = async (taskId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await TaskApi.delete(taskId);
      
      if (response.status === 'success') {
        // Find the task to get its status
        const taskToDelete = tasks.find(task => task._id === taskId);
        
        if (taskToDelete) {
          // Remove task from tasks list
          setTasks(prev => prev.filter(task => task._id !== taskId));
          
          // Remove task from columns
          setColumns(prev => ({
            ...prev,
            [taskToDelete.status]: prev[taskToDelete.status].filter(
              task => task._id !== taskId
            )
          }));
        }
        
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch boards on initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchBoards();
    }
  }, [isAuthenticated, fetchBoards]);

  // Fetch board when boardId changes
  useEffect(() => {
    if (boardId && isAuthenticated) {
      fetchBoard(boardId);
    }
  }, [boardId, isAuthenticated, fetchBoard]);

  return {
    boards,
    currentBoard,
    tasks,
    columns,
    loading,
    error,
    // Board operations
    fetchBoards,
    fetchBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    addMember,
    removeMember,
    // Task operations
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
  };
};
