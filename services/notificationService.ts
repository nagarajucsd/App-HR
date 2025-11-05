import api from './api';
import { Notification } from '../types';

// Helper to normalize MongoDB data
const normalizeNotification = (data: any): Notification => {
  if (data._id && !data.id) {
    data.id = data._id.toString();
  }
  if (data.userId && typeof data.userId === 'object') {
    data.userId = data.userId._id || data.userId.id;
  }
  // CRITICAL FIX: Normalize timestamp field
  // Backend uses createdAt (from timestamps: true), frontend expects timestamp
  if (data.createdAt && !data.timestamp) {
    data.timestamp = data.createdAt;
  }
  return data;
};

export const notificationService = {
  // Get all notifications for current user
  async getAllNotifications(): Promise<Notification[]> {
    const response = await api.get('/notifications');
    return response.data.map(normalizeNotification);
  },

  // Create notification
  async createNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<Notification> {
    const response = await api.post('/notifications', notification);
    return normalizeNotification(response.data);
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<Notification> {
    const response = await api.put(`/notifications/${id}`);
    return normalizeNotification(response.data);
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ message: string }> {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  },

  // Delete notification
  async deleteNotification(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};
