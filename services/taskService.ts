import api from './api';
import { Task, TaskPriority, TaskStatus } from '../types';

const normalizeTask = (data: any): Task => {
  if (data._id && !data.id) {
    data.id = data._id.toString();
  }
  if (data.assignedTo && typeof data.assignedTo === 'object') {
    data.assignedTo = data.assignedTo._id || data.assignedTo.id;
  }
  if (data.assignedBy && typeof data.assignedBy === 'object') {
    data.assignedBy = data.assignedBy._id || data.assignedBy.id;
  }
  if (data.departmentId && typeof data.departmentId === 'object') {
    data.departmentId = data.departmentId._id || data.departmentId.id;
  }
  return data;
};

export const taskService = {
  async getAllTasks(filters?: { status?: TaskStatus; priority?: TaskPriority; assignedTo?: string; departmentId?: string }): Promise<Task[]> {
    try {
      console.log('🔍 Fetching tasks from API...');
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
      if (filters?.departmentId) params.append('departmentId', filters.departmentId);
      
      const response = await api.get(`/tasks?${params.toString()}`);
      const tasks = response.data.map(normalizeTask);
      console.log('✅ Tasks loaded:', tasks.length);
      return tasks;
    } catch (error: any) {
      console.error('❌ Failed to fetch tasks:', error.response?.data || error.message);
      throw error;
    }
  },

  async getTaskById(id: string): Promise<Task> {
    try {
      const response = await api.get(`/tasks/${id}`);
      return normalizeTask(response.data);
    } catch (error: any) {
      console.error('❌ Failed to fetch task:', error.response?.data || error.message);
      throw error;
    }
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    try {
      console.log('➕ Creating task...');
      const response = await api.post('/tasks', task);
      const newTask = normalizeTask(response.data);
      console.log('✅ Task created:', newTask.id);
      return newTask;
    } catch (error: any) {
      console.error('❌ Failed to create task:', error.response?.data || error.message);
      throw error;
    }
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      console.log('📝 Updating task:', id);
      const response = await api.put(`/tasks/${id}`, updates);
      const updatedTask = normalizeTask(response.data);
      console.log('✅ Task updated');
      return updatedTask;
    } catch (error: any) {
      console.error('❌ Failed to update task:', error.response?.data || error.message);
      throw error;
    }
  },

  async deleteTask(id: string): Promise<void> {
    try {
      console.log('🗑️ Deleting task:', id);
      await api.delete(`/tasks/${id}`);
      console.log('✅ Task deleted');
    } catch (error: any) {
      console.error('❌ Failed to delete task:', error.response?.data || error.message);
      throw error;
    }
  },
};
