import React, { useState, useEffect } from 'react';
import { Notification, User, UserRole } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import Icon, { IconName } from '../common/Icon';
import { timeAgo } from '../../utils/timeAgo';
import { notificationService } from '../../services/notificationService';
import { useToast } from '../../hooks/useToast';

interface NotificationsPageProps {
  user: User;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  setActivePage: (page: string) => void;
}

// Helper to get icon and color based on notification content
const getNotificationDetails = (title: string): { icon: IconName; color: string } => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('leave')) return { icon: 'calendar', color: 'blue' };
  if (lowerTitle.includes('attendance')) return { icon: 'clock', color: 'green' };
  if (lowerTitle.includes('task')) return { icon: 'check', color: 'purple' };
  if (lowerTitle.includes('employee')) return { icon: 'users', color: 'orange' };
  if (lowerTitle.includes('department')) return { icon: 'briefcase', color: 'indigo' };
  if (lowerTitle.includes('payroll')) return { icon: 'cash', color: 'emerald' };
  return { icon: 'bell', color: 'gray' };
};

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
  green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
};

const NotificationsPage: React.FC<NotificationsPageProps> = ({ user, notifications, setNotifications, setActivePage }) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  // Load notifications from API
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        console.log('🔔 Loading notifications from API...');
        const notificationsData = await notificationService.getAllNotifications();
        setNotifications(notificationsData);
        console.log('✅ Notifications loaded:', notificationsData.length);
      } catch (error: any) {
        console.error('❌ Failed to load notifications:', error);
      }
    };

    loadNotifications();

    // Auto-refresh every 5 seconds
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [setNotifications]);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notification: Notification) => {
    try {
      // Mark as read if not already read
      if (!notification.read) {
        await notificationService.markAsRead(notification.id);
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
      }
      
      // Navigate to the linked page if link exists
      if (notification.link) {
        let pageName = '';
        
        // Role-based navigation for leave notifications
        if (notification.link === '/leaves') {
          // HR, Admin, Manager should go to "Leave Requests" to manage requests
          // Employee should go to "My Leaves" to see their own leaves
          if (user.role === UserRole.Admin || user.role === UserRole.HR || user.role === UserRole.Manager) {
            pageName = 'Leave Requests';
            console.log('🔗 Redirecting', user.role, 'from /leaves to Leave Requests');
          } else {
            pageName = 'My Leaves';
            console.log('🔗 Redirecting Employee from /leaves to My Leaves');
          }
        } else {
          // Map other notification links to actual page names
          const linkToPageMap: Record<string, string> = {
            '/payroll': 'Payroll',
            '/leave-requests': 'Leave Requests',
            '/attendance': 'Attendance',
            '/tasks': 'Tasks',
            '/employees': 'Employees',
            '/departments': 'Departments',
            '/reports': 'Reports',
            '/profile': 'Profile',
          };
          
          pageName = linkToPageMap[notification.link] || notification.link.replace(/^\//, '').charAt(0).toUpperCase() + notification.link.slice(1);
        }
        
        console.log('🔗 Navigating from', notification.link, 'to page:', pageName, 'for role:', user.role);
        setActivePage(pageName);
      }
    } catch (error: any) {
      console.error('❌ Failed to mark as read:', error);
      addToast({ type: 'error', message: 'Failed to mark notification as read' });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      setIsLoading(true);
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      addToast({ type: 'success', message: 'All notifications marked as read' });
    } catch (error: any) {
      console.error('❌ Failed to mark all as read:', error);
      addToast({ type: 'error', message: 'Failed to mark all as read' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      addToast({ type: 'success', message: 'Notification deleted' });
    } catch (error: any) {
      console.error('❌ Failed to delete notification:', error);
      addToast({ type: 'error', message: 'Failed to delete notification' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You\'re all caught up!'}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} disabled={isLoading}>
            <Icon name="check" className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <Card>
        <div className="flex border-b border-border">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 font-medium transition-colors ${
              filter === 'all'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-6 py-3 font-medium transition-colors ${
              filter === 'unread'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-6 py-3 font-medium transition-colors ${
              filter === 'read'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => {
            const details = getNotificationDetails(notification.title);
            const colors = colorClasses[details.color];

            return (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  !notification.read ? 'border-l-4 border-l-primary bg-secondary/30' : ''
                }`}
                onClick={() => handleMarkAsRead(notification)}
              >
                <div className="p-4 flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 flex-shrink-0 ${colors.bg} flex items-center justify-center rounded-full`}>
                    <Icon name={details.icon} className={`w-6 h-6 ${colors.text}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                          {!notification.read && (
                            <span className="ml-2 inline-block w-2 h-2 bg-primary rounded-full"></span>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {timeAgo(notification.timestamp || (notification as any).createdAt)}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(notification.id, e)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors group"
                        title="Delete notification"
                      >
                        <Icon name="x" className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
                      </button>
                    </div>

                    {/* Action button for notifications with links - Role-aware display */}
                    {notification.link && (() => {
                      // For leave notifications, only show button to appropriate roles
                      if (notification.link === '/leaves' || notification.link === '/leave-requests') {
                        const isManagementRole = user.role === UserRole.Admin || user.role === UserRole.HR || user.role === UserRole.Manager;
                        const isEmployee = user.role === UserRole.Employee;
                        
                        // Show "Leave Requests" button only to management
                        if (notification.link === '/leave-requests' && !isManagementRole) {
                          return null;
                        }
                        
                        // For /leaves link, show appropriate button
                        if (notification.link === '/leaves') {
                          return (
                            <div className="mt-3">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification);
                                }}
                                className="text-xs"
                              >
                                <Icon name="arrow-right" className="w-3 h-3 mr-1" />
                                Go to {isManagementRole ? 'Leave Requests' : 'My Leaves'}
                              </Button>
                            </div>
                          );
                        }
                      }
                      
                      // For other notifications, show button normally
                      return (
                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification);
                            }}
                            className="text-xs"
                          >
                            <Icon name="arrow-right" className="w-3 h-3 mr-1" />
                            Go to {notification.link.replace(/^\//, '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </Button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card>
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="bell" className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {filter === 'unread' ? 'No unread notifications' : filter === 'read' ? 'No read notifications' : 'No notifications'}
              </h3>
              <p className="text-muted-foreground">
                {filter === 'unread' 
                  ? 'You\'re all caught up! Check back later for updates.' 
                  : filter === 'read'
                  ? 'You haven\'t read any notifications yet.'
                  : 'You don\'t have any notifications yet.'}
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Stats Card */}
      {notifications.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Notification Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-3xl font-bold text-foreground">{notifications.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Total</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-3xl font-bold text-primary">{unreadCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Unread</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-3xl font-bold text-foreground">{notifications.length - unreadCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Read</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default NotificationsPage;
