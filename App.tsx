
import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import LoginPage from './components/LoginPage';
// FIX: Corrected imports from the now-fixed types.ts file.
import { User, UserRole, AttendanceRecord, AttendanceStatus, LeaveRequest, Employee, Department, PayrollRecord, LeaveBalance, LeaveStatus, LeaveType, Notification, Task } from './types';
import { ToastProvider, useToast } from './hooks/useToast';
import { mockAttendance, mockLeaveRequests, mockUserWeeklyProgress, mockEmployees, mockDepartments, mockPayroll, initialLeaveBalances, mockUsers, mockNotifications } from './data/mockData';
import { getLocalDateString } from './utils/dateUtils';

// Page Components
import DashboardPage from './components/pages/DashboardPage';
import EmployeesPage from './components/pages/EmployeesPage';
import DepartmentsPage from './components/pages/DepartmentsPage';
import AttendancePage from './components/pages/AttendancePage';
import LeavePage from './components/pages/LeavePage';
import LeaveManagementPage from './components/pages/LeaveManagementPage';
import PayrollPage from './components/pages/PayrollPage';
import ReportsPage from './components/pages/ReportsPage';
import ProfilePage from './components/pages/ProfilePage';
import SettingsPage from './components/pages/SettingsPage';
import TasksPage from './components/pages/TasksPage';
import NotificationsPage from './components/pages/NotificationsPage';
import MFASetupPage from './components/mfa/MFASetupPage';
import MFAVerificationPage from './components/mfa/MFAVerificationPage';
import MfaRecoveryPage from './components/mfa/MfaRecoveryPage';
import CaptchaVerificationPage from './components/mfa/CaptchaVerificationPage';
import UndoNotification from './components/common/UndoNotification';

type AuthState = 'loggedOut' | 'needsMfaSetup' | 'needsMfaVerification' | 'mfaRecovery' | 'captchaForReset' | 'authenticated';

const FORTY_HOURS_MS = 40 * 60 * 60 * 1000;

// Helper to get a consistent weekly ID using Monday as the start of the week.
const getWeekIdentifier = (d: Date): string => {
    const date = new Date(d);
    const day = date.getDay(); // Sunday - 0, Monday - 1, etc.
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday to go to previous Monday
    date.setDate(diff);
    return date.toISOString().split('T')[0];
};

const formatMillisecondsToHHMMSS = (ms: number) => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<string>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authState, setAuthState] = useState<AuthState>('loggedOut');
  
  // Centralized State - Keep users as mock for login, but departments will load from API
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(mockAttendance);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(mockPayroll);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>(initialLeaveBalances);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [todayAttendanceRecord, setTodayAttendanceRecord] = useState<AttendanceRecord | null>(null);
  
  // New state for weekly timer
  const [weeklyAccumulatedMs, setWeeklyAccumulatedMs] = useState(0);
  const [isWeeklyTimerActive, setIsWeeklyTimerActive] = useState(true);
  
  // State for clock action tracking and undo
  const [lastClockActionTime, setLastClockActionTime] = useState<number>(0);
  const [showUndoNotification, setShowUndoNotification] = useState(false);
  const [undoAction, setUndoAction] = useState<'clockIn' | 'clockOut' | null>(null);
  const [previousAttendanceState, setPreviousAttendanceState] = useState<AttendanceRecord | null>(null);


  const { addToast } = useToast();

  // ENHANCEMENT: Restore undo state from localStorage on mount
  useEffect(() => {
    if (authState === 'authenticated' && currentUser) {
      const savedUndo = localStorage.getItem(`undo_${currentUser.id}`);
      if (savedUndo) {
        try {
          const undoData = JSON.parse(savedUndo);
          const timeSinceAction = Date.now() - undoData.timestamp;
          
          // Only restore if within 5 minutes (300000ms)
          if (timeSinceAction < 300000) {
            setPreviousAttendanceState(undoData.previousState);
            setUndoAction(undoData.action);
            setLastClockActionTime(undoData.timestamp);
            setShowUndoNotification(true);
            console.log('✅ Restored undo state from localStorage');
          } else {
            // Clear expired undo data
            localStorage.removeItem(`undo_${currentUser.id}`);
          }
        } catch (error) {
          console.error('Failed to restore undo state:', error);
          localStorage.removeItem(`undo_${currentUser.id}`);
        }
      }
    }
  }, [authState, currentUser]);

  // Load data from API when authenticated
  useEffect(() => {
    const loadDataFromAPI = async () => {
      if (authState !== 'authenticated') return;

      try {
        console.log('🔄 Loading data from API...');
        const { employeeService } = await import('./services/employeeService');
        const { departmentService } = await import('./services/departmentService');
        const { leaveService } = await import('./services/leaveService');
        const { attendanceService } = await import('./services/attendanceService');
        const { taskService } = await import('./services/taskService');
        const { notificationService } = await import('./services/notificationService');

        // Load all data in parallel
        const { payrollService } = await import('./services/payrollService');
        const [employeesData, departmentsData, leavesData, attendanceData, tasksData, notificationsData, leaveBalancesData, payrollData] = await Promise.all([
          employeeService.getAllEmployees().catch(() => employees),
          departmentService.getAllDepartments().catch(() => departments),
          leaveService.getAllLeaveRequests().catch(() => leaveRequests),
          attendanceService.getAllAttendance().catch(() => attendanceRecords),
          taskService.getAllTasks().catch(() => []),
          notificationService.getAllNotifications().catch(() => notifications),
          leaveService.getAllLeaveBalances().catch(() => leaveBalances),
          payrollService.getAllPayrollRecords().catch(() => payrollRecords)
        ]);

        console.log('✅ Data loaded:', {
          employees: employeesData.length,
          departments: departmentsData.length,
          leaves: leavesData.length,
          attendance: attendanceData.length,
          notifications: notificationsData.length,
          tasks: tasksData.length,
          leaveBalances: leaveBalancesData.length,
          payroll: payrollData.length
        });

        setEmployees(employeesData);
        setDepartments(departmentsData);
        setLeaveRequests(leavesData);
        setAttendanceRecords(attendanceData);
        setTasks(tasksData);
        setNotifications(notificationsData);
        setLeaveBalances(leaveBalancesData);
        setPayrollRecords(payrollData);
      } catch (error) {
        console.error('❌ Failed to load data from API:', error);
      }
    };

    loadDataFromAPI();
  }, [authState]);

  // Auto-refresh data every 3 seconds when authenticated (FASTER for real-time)
  useEffect(() => {
    if (authState !== 'authenticated' || !currentUser) return;

    const refreshInterval = setInterval(async () => {
      try {
        console.log('🔄 Auto-refreshing data...');
        const { employeeService } = await import('./services/employeeService');
        const { departmentService } = await import('./services/departmentService');
        const { leaveService } = await import('./services/leaveService');
        const { attendanceService } = await import('./services/attendanceService');
        const { taskService } = await import('./services/taskService');
        const { notificationService } = await import('./services/notificationService');

        const { payrollService } = await import('./services/payrollService');
        const [employeesData, departmentsData, leavesData, attendanceData, tasksData, notificationsData, leaveBalancesData, payrollData] = await Promise.all([
          employeeService.getAllEmployees().catch(() => employees),
          departmentService.getAllDepartments().catch(() => departments),
          leaveService.getAllLeaveRequests().catch(() => leaveRequests),
          attendanceService.getAllAttendance().catch(() => attendanceRecords),
          taskService.getAllTasks().catch(() => tasks),
          notificationService.getAllNotifications().catch(() => notifications),
          leaveService.getAllLeaveBalances().catch(() => leaveBalances),
          payrollService.getAllPayrollRecords().catch(() => payrollRecords)
        ]);

        setEmployees(employeesData);
        setDepartments(departmentsData);
        setLeaveRequests(leavesData);
        setAttendanceRecords(attendanceData);
        setTasks(tasksData);
        setLeaveBalances(leaveBalancesData);
        setPayrollRecords(payrollData);
        
        // Check for new notifications and show toast
        const newUnreadCount = notificationsData.filter(n => !n.read).length;
        const oldUnreadCount = notifications.filter(n => !n.read).length;
        
        // Show toast if unread count increased
        if (newUnreadCount > oldUnreadCount) {
          const newNotifications = notificationsData
            .filter(n => !n.read)
            .filter(newN => !notifications.some(oldN => oldN.id === newN.id));
          
          if (newNotifications.length > 0) {
            console.log('🔔 New notification detected:', newNotifications[0]);
            addToast({ 
              type: 'info', 
              message: `🔔 ${newNotifications[0].title}: ${newNotifications[0].message}` 
            });
          }
        }
        
        setNotifications(notificationsData);
        
        // CRITICAL: Update today's attendance record for timer continuity
        const todayStr = getLocalDateString();
        // Find current employee to get correct employeeId
        const currentEmp = employeesData.find(emp => emp.email === currentUser.email);
        const empId = currentEmp?.id || currentEmp?._id || currentUser.id;
        
        const userRecordForToday = attendanceData.find(rec => {
          const recEmpId = typeof rec.employeeId === 'string'
            ? rec.employeeId
            : (rec.employeeId as any)?._id || (rec.employeeId as any)?.id || rec.employeeId;
          return recEmpId === empId && rec.date === todayStr;
        });
        
        if (userRecordForToday) {
          setTodayAttendanceRecord(userRecordForToday);
        }
        
        console.log('✅ Auto-refresh complete:', {
          employees: employeesData.length,
          departments: departmentsData.length,
          leaves: leavesData.length,
          attendance: attendanceData.length,
          tasks: tasksData.length,
          notifications: notificationsData.length,
          leaveBalances: leaveBalancesData.length,
          todayAttendance: userRecordForToday ? 'Updated' : 'None'
        });
      } catch (error) {
        console.error('❌ Auto-refresh failed:', error);
      }
    }, 3000); // Refresh every 3 seconds for REAL-TIME updates

    return () => clearInterval(refreshInterval);
  }, [authState, currentUser]);

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    try {
      // Send notification to backend API for proper user targeting
      const { notificationService } = await import('./services/notificationService');
      const createdNotification = await notificationService.createNotification({
        ...notification,
        userId: notification.userId || currentUser?.id || ''
      });
      
      // Only update local state if notification is for current user
      if (createdNotification.userId === currentUser?.id) {
        setNotifications(prev => [createdNotification, ...prev]);
      }
      
      console.log('✅ Notification created:', createdNotification);
    } catch (error) {
      console.error('❌ Failed to create notification:', error);
      // Fallback to local state only (for offline scenarios)
      const newNotification: Notification = {
          ...notification,
          userId: notification.userId || currentUser?.id || '',
          id: `notif-${Date.now()}`,
          timestamp: new Date().toISOString(),
          read: false,
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  }, [currentUser]);

  const handleApplyLeave = useCallback(async (newRequest: Omit<LeaveRequest, 'id' | 'status' | 'days' | 'employeeId' | 'employeeName'>) => {
    if (!currentUser) return;

    try {
      // Find the employee record for the current user
      const currentEmployee = employees.find(emp => emp.email === currentUser.email);
      
      if (!currentEmployee) {
        addToast('Employee record not found', 'error');
        return;
      }

      const startDate = new Date(newRequest.startDate);
      const endDate = new Date(newRequest.endDate);
      const timeDiff = endDate.getTime() - startDate.getTime();
      const dayDiff = timeDiff / (1000 * 3600 * 24) + 1;

      // Create leave request via API using employee's _id
      const { leaveService } = await import('./services/leaveService');
      const createdRequest = await leaveService.createLeaveRequest({
        ...newRequest,
        employeeId: currentEmployee.id, // Use employee's MongoDB _id
        employeeName: currentUser.name,
        days: dayDiff,
      });

      // Update local state
      setLeaveRequests(prev => [createdRequest, ...prev]);

      setLeaveBalances(prev => prev.map(empBalance => {
          if (empBalance.employeeId === currentEmployee.id) {
              const newBalances = empBalance.balances.map(balance => {
                  if (balance.type === newRequest.leaveType) {
                      return { ...balance, pending: balance.pending + dayDiff };
                  }
                  return balance;
              });
              return { ...empBalance, balances: newBalances };
          }
          return empBalance;
      }));

      addToast({ type: 'success', message: 'Leave request submitted successfully!' });
      
      // Send notification to all HR/Admin users (not the employee who submitted)
      const hrAdminUsers = users.filter(u => (u.role === UserRole.HR || u.role === UserRole.Admin) && u.id !== currentUser.id);
      for (const hrUser of hrAdminUsers) {
        await addNotification({ 
          userId: hrUser.id,
          title: 'New Leave Request', 
          message: `${currentUser.name} requested ${dayDiff} day(s) of ${newRequest.leaveType} leave.`, 
          link: 'Leave Requests' 
        });
      }
      
      // Refresh leave requests AND leave balances from API to ensure sync
      const [allLeaves, allBalances] = await Promise.all([
        leaveService.getAllLeaveRequests(),
        leaveService.getAllLeaveBalances()
      ]);
      setLeaveRequests(allLeaves);
      setLeaveBalances(allBalances);
      
      console.log('✅ Leave request submitted and data refreshed');
      
    } catch (error: any) {
      console.error('❌ Failed to submit leave request:', error);
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to submit leave request' });
    }
  }, [currentUser, employees, users, addToast, addNotification]);

  const handleLeaveAction = useCallback(async (requestId: string, newStatus: LeaveStatus.Approved | LeaveStatus.Rejected, employeeId: string, leaveType: LeaveType, days: number) => {
    try {
      // Update leave request status via API
      const { leaveService } = await import('./services/leaveService');
      const updatedRequest = await leaveService.updateLeaveRequestStatus(requestId, newStatus);

      // Update local state
      setLeaveRequests(prev => prev.map(req => req.id === requestId ? updatedRequest : req));

      setLeaveBalances(prev => prev.map(empBalance => {
          if (empBalance.employeeId === employeeId) {
              const newBalances = empBalance.balances.map(balance => {
                  if (balance.type === leaveType) {
                      const updatedBalance = { ...balance, pending: balance.pending - days };
                      if (newStatus === LeaveStatus.Approved) {
                          updatedBalance.used += days;
                      }
                      return updatedBalance;
                  }
                  return balance;
              });
              return { ...empBalance, balances: newBalances };
          }
          return empBalance;
      }));
      
      // Send notification to the employee whose leave was approved/rejected
      const employee = employees.find(e => e.id === employeeId);
      if (employee) {
          // Find the user account for this employee
          const employeeUser = users.find(u => u.email === employee.email);
          if (employeeUser) {
            await addNotification({ 
              userId: employeeUser.id,
              title: 'Leave Request Update', 
              message: `Your ${leaveType} leave request has been ${newStatus.toLowerCase()}.`, 
              link: 'My Leaves' 
            });
          }
      }
      addToast({ type: 'success', message: `Leave request has been ${newStatus.toLowerCase()}.` });
      
      // Refresh leave balances from API to ensure sync
      const allBalances = await leaveService.getAllLeaveBalances();
      setLeaveBalances(allBalances);
      
      console.log('✅ Leave request updated and balances refreshed');
    } catch (error: any) {
      console.error('❌ Failed to update leave request:', error);
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to update leave request' });
    }
  }, [addToast, addNotification, employees, users]);

  const handleTaskNotification = useCallback(async (notification: { userId?: string; userIds?: string[]; title: string; message: string; link?: string }) => {
    try {
      // Support both single user and multiple users
      const targetUserIds = notification.userIds || (notification.userId ? [notification.userId] : []);
      
      console.log('📬 handleTaskNotification called:', {
        title: notification.title,
        targetUserIds: targetUserIds,
        totalUsers: users.length
      });
      
      for (const userId of targetUserIds) {
        const targetUser = users.find(u => u.id === userId);
        if (targetUser) {
          console.log('📤 Sending notification to:', targetUser.name, '(', targetUser.email, ')');
          await addNotification({
            userId: targetUser.id,
            title: notification.title,
            message: notification.message,
            link: notification.link || 'Tasks'
          });
          console.log('✅ Task notification sent to:', targetUser.name);
        } else {
          console.warn('⚠️ User not found for ID:', userId);
        }
      }
    } catch (error) {
      console.error('❌ Failed to send task notification:', error);
    }
  }, [users, addNotification]);

  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
    // Check if MFA is setup
    if (user.isMfaSetup) {
      setAuthState('needsMfaVerification');
    } else {
      setAuthState('needsMfaSetup');
    }
  }, []);

  const handleMfaRecovery = useCallback(() => {
    // CRITICAL FIX: Skip CAPTCHA, go directly to email-based recovery
    // User will receive a secure recovery link via email instead
    setAuthState('mfaRecovery');
  }, []);

  const handleCaptchaVerifiedForReset = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      // Reset MFA after CAPTCHA verification
      const { authService } = await import('./services/authService');
      await authService.resetMFA();
      
      // Update user state
      const updatedUser = { ...currentUser, isMfaSetup: false };
      setCurrentUser(updatedUser);
      
      // Go to MFA setup
      setAuthState('needsMfaSetup');
      addToast({ type: 'success', message: 'MFA reset successful. Please set up MFA again.' });
    } catch (error: any) {
      console.error('❌ Failed to reset MFA:', error);
      addToast({ type: 'error', message: 'Failed to reset MFA. Please try again.' });
      setAuthState('needsMfaVerification');
    }
  }, [currentUser, addToast]);

  const handleMfaComplete = useCallback((isSetup: boolean) => {
    if (!currentUser) return;

    let userToAuthenticate = currentUser;

    // If this was the initial setup, persist the `isMfaSetup` flag.
    if (isSetup) {
      const updatedUser = { ...currentUser, isMfaSetup: true };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      userToAuthenticate = updatedUser; // Use the updated user for the session logic
    }

    // --- Common logic for post-MFA authentication ---

    setAuthState('authenticated');
    setActivePage('Dashboard');

    // --- Initialize Weekly Timer (Load from backend) ---
    const loadWeeklyProgress = async () => {
      try {
        const { attendanceService } = await import('./services/attendanceService');
        const weeklyData = await attendanceService.getWeeklyHours(userToAuthenticate.id);
        
        // Convert minutes to milliseconds
        const accumulatedMs = weeklyData.totalMinutes * 60 * 1000;
        setWeeklyAccumulatedMs(accumulatedMs);

        // Check if the user has already completed their 40 hours for the week
        if (accumulatedMs >= FORTY_HOURS_MS) {
          setIsWeeklyTimerActive(false);
        } else {
          setIsWeeklyTimerActive(true);
        }
      } catch (error) {
        console.error('Failed to load weekly progress:', error);
        setWeeklyAccumulatedMs(0);
        setIsWeeklyTimerActive(true);
      }
    };

    loadWeeklyProgress();

    // --- Check Today's Attendance (Load from API for accuracy) ---
    const loadTodayAttendance = async () => {
      try {
        const { attendanceService } = await import('./services/attendanceService');
        const todayStr = getLocalDateString();
        
        // Get all attendance and find today's record
        const allAttendance = await attendanceService.getAllAttendance();
        
        // CRITICAL FIX: Find employee record to get correct employee ID
        const { employeeService } = await import('./services/employeeService');
        const allEmployees = await employeeService.getAllEmployees();
        const currentEmployee = allEmployees.find(emp => emp.email === userToAuthenticate.email);
        const employeeId = currentEmployee?.id || (currentEmployee as any)?._id || userToAuthenticate.id;
        
        console.log('🔍 Looking for attendance with Employee ID:', employeeId, 'for date:', todayStr);
        
        const userRecordForToday = allAttendance.find(rec => {
          const recEmpId = typeof rec.employeeId === 'string' 
            ? rec.employeeId 
            : (rec.employeeId as any)?._id || (rec.employeeId as any)?.id || rec.employeeId;
          return recEmpId === employeeId && rec.date === todayStr;
        });
        
        if (userRecordForToday) {
          console.log('✅ Today attendance loaded:', userRecordForToday);
          setTodayAttendanceRecord(userRecordForToday);
          setAttendanceRecords(allAttendance);
        } else {
          console.log('ℹ️  No attendance record for today - This is normal on weekends or before clock-in');
          setTodayAttendanceRecord(null);
          setAttendanceRecords(allAttendance);
        }
      } catch (error) {
        console.error('Failed to load today attendance:', error);
        setTodayAttendanceRecord(null);
      }
    };

    loadTodayAttendance();
  }, [currentUser, setUsers]);


  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setTodayAttendanceRecord(null);
    setAuthState('loggedOut');
  }, []);

  const handleClockIn = useCallback(async () => {
    if (!currentUser) return;

    try {
      // CRITICAL FIX: Find employee record to get correct employee ID
      const currentEmployee = employees.find(emp => emp.email === currentUser.email);
      
      if (!currentEmployee) {
        addToast({ type: 'error', message: 'Employee record not found. Please contact HR.' });
        return;
      }
      
      const employeeId = currentEmployee.id || currentEmployee._id;
      
      // Save previous state for undo
      setPreviousAttendanceState(todayAttendanceRecord);
      
      const now = new Date();
      const todayStr = getLocalDateString();
      const clockInTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      console.log('🕐 Clock in initiated for:', currentUser.name);
      console.log('   Employee ID:', employeeId);

      // Call backend API to create attendance with timestamp
      const api = (await import('./services/api')).default;
      const response = await api.post('/attendance', {
        employeeId: employeeId, // Use employee's MongoDB _id
        date: todayStr,
        status: 'Present',
        clockIn: clockInTimeStr,
        clockInTimestamp: now.toISOString()
      });

      const newRecord = response.data;
      
      // Normalize the response
      if (newRecord._id && !newRecord.id) {
        newRecord.id = newRecord._id.toString();
      }
      
      // Store the original employeeId for matching
      const recordEmployeeId = newRecord.employeeId?._id || newRecord.employeeId?.id || newRecord.employeeId;
      
      // If employeeId is populated object, extract the ID
      if (newRecord.employeeId && typeof newRecord.employeeId === 'object') {
        newRecord.employeeId = recordEmployeeId;
      }

      console.log('✅ Clock in successful:', newRecord);
      console.log('   Record ID:', newRecord.id);
      console.log('   Employee ID:', newRecord.employeeId);
      console.log('   Clock In Time:', newRecord.clockIn);

      // Update local state immediately
      setTodayAttendanceRecord(newRecord);
      setAttendanceRecords(prev => {
        // Remove any existing record for today and add the new one
        const filtered = prev.filter(r => {
          const rEmpId = r.employeeId?._id || r.employeeId?.id || r.employeeId;
          return !(rEmpId === employeeId && r.date === todayStr);
        });
        return [...filtered, newRecord];
      });
      
      // Set last action time and show undo notification
      const actionTime = Date.now();
      setLastClockActionTime(actionTime);
      setUndoAction('clockIn');
      setShowUndoNotification(true);
      
      // ENHANCEMENT: Save undo state to localStorage (persists across page refresh)
      localStorage.setItem(`undo_${currentUser.id}`, JSON.stringify({
        action: 'clockIn',
        timestamp: actionTime,
        previousState: previousAttendanceState,
        attendanceId: newRecord.id
      }));
      
      // Reload all attendance data to ensure sync across all users
      const { attendanceService } = await import('./services/attendanceService');
      const allAttendance = await attendanceService.getAllAttendance();
      setAttendanceRecords(allAttendance);
      
      addToast({ type: 'success', message: 'Clocked in successfully! ✅ (Undo available for 5 minutes)' });
    } catch (error: any) {
      console.error('❌ Clock in error:', error);
      
      // ENHANCEMENT: Better error messages
      if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes('already exists')) {
          addToast({ 
            type: 'warning', 
            message: '⚠️ Already clocked in today. Check your attendance calendar.' 
          });
        }
        
        // Reload attendance to get the existing record
        try {
          const { attendanceService } = await import('./services/attendanceService');
          const allAttendance = await attendanceService.getAllAttendance();
          setAttendanceRecords(allAttendance);
          
          const todayStr = getLocalDateString();
          // Find current employee to get correct employeeId
          const currentEmp = employees.find(emp => emp.email === currentUser.email);
          const empId = currentEmp?.id || currentEmp?._id || currentUser.id;
          
          const existingRecord = allAttendance.find(r => {
            const recEmpId = typeof r.employeeId === 'string'
              ? r.employeeId
              : (r.employeeId as any)?._id || (r.employeeId as any)?.id || r.employeeId;
            return recEmpId === empId && r.date === todayStr;
          });
          
          if (existingRecord) {
            console.log('✅ Found existing attendance record:', existingRecord);
            setTodayAttendanceRecord(existingRecord);
          }
        } catch (reloadError) {
          console.error('Failed to reload attendance:', reloadError);
        }
      } else if (error.response?.status === 401) {
        addToast({ type: 'error', message: '🔒 Session expired. Please login again.' });
        // Note: User will need to manually logout and login again
      } else if (error.response?.status === 500) {
        addToast({ type: 'error', message: '⚠️ Server error. Please contact IT support if this persists.' });
      } else if (error.message?.includes('Network')) {
        addToast({ type: 'error', message: '📡 Network error. Please check your internet connection.' });
      } else {
        addToast({ type: 'error', message: '❌ Failed to clock in. Please try again or contact support.' });
      }
    }
  }, [currentUser, todayAttendanceRecord, employees, addToast, previousAttendanceState]);

  const handleClockOut = useCallback(async () => {
    if (currentUser && todayAttendanceRecord && todayAttendanceRecord.clockIn && !todayAttendanceRecord.clockOut) {
        try {
            // CRITICAL FIX: Find employee record to get correct employee ID
            const currentEmployee = employees.find(emp => emp.email === currentUser.email);
            
            if (!currentEmployee) {
              addToast({ type: 'error', message: 'Employee record not found. Please contact HR.' });
              return;
            }
            
            const employeeId = currentEmployee.id || currentEmployee._id;
            
            // Save previous state for undo
            setPreviousAttendanceState(todayAttendanceRecord);
            
            const now = new Date();
            const clockOutTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            console.log('🕐 Clock out initiated for:', currentUser.name);
            console.log('   Employee ID:', employeeId);

            // Calculate work duration from timestamp if available, otherwise from clock-in string
            // Add 40 seconds initial offset
            const INITIAL_OFFSET_MS = 40 * 1000;
            let sessionDurationMs = 0;
            if (todayAttendanceRecord.clockInTimestamp) {
                const clockInTime = new Date(todayAttendanceRecord.clockInTimestamp).getTime();
                sessionDurationMs = now.getTime() - clockInTime + INITIAL_OFFSET_MS;
            } else {
                // Fallback to parsing clock-in string
                const [time, modifier] = todayAttendanceRecord.clockIn.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                if (modifier === 'PM' && hours < 12) hours += 12;
                if (modifier === 'AM' && hours === 12) hours = 0;
                
                const [year, month, day] = todayAttendanceRecord.date.split('-').map(Number);
                const clockInDate = new Date(year, month - 1, day, hours, minutes);
                sessionDurationMs = now.getTime() - clockInDate.getTime() + INITIAL_OFFSET_MS;
            }
            
            const workMinutes = Math.floor(sessionDurationMs / 60000);
            const sessionWorkHoursStr = formatMillisecondsToHHMMSS(sessionDurationMs);
            
            // Call backend API to clock out
            const api = (await import('./services/api')).default;
            await api.post('/attendance/clock-out', {
                employeeId: employeeId, // Use employee's MongoDB _id
                clockOut: clockOutTimeStr,
                workHours: sessionWorkHoursStr,
                workMinutes
            });

            console.log('✅ Clock out successful');

            // Reload weekly hours from backend using employee ID
            const { attendanceService } = await import('./services/attendanceService');
            const weeklyData = await attendanceService.getWeeklyHours(employeeId);
            const newAccumulatedMs = weeklyData.totalMinutes * 60 * 1000;
            
            const updatedRecord = {
                ...todayAttendanceRecord,
                clockOut: clockOutTimeStr,
                clockOutTimestamp: now.toISOString(),
                workHours: sessionWorkHoursStr,
                workMinutes
            };

            // Update local state immediately
            setTodayAttendanceRecord(updatedRecord);
            setAttendanceRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
            setWeeklyAccumulatedMs(newAccumulatedMs);
            
            // Set last action time and show undo notification
            const actionTime = Date.now();
            setLastClockActionTime(actionTime);
            setUndoAction('clockOut');
            setShowUndoNotification(true);
            
            // ENHANCEMENT: Save undo state to localStorage (persists across page refresh)
            localStorage.setItem(`undo_${currentUser.id}`, JSON.stringify({
              action: 'clockOut',
              timestamp: actionTime,
              previousState: previousAttendanceState,
              attendanceId: updatedRecord.id
            }));

            // Reload all attendance data to ensure sync across all users
            const allAttendance = await attendanceService.getAllAttendance();
            setAttendanceRecords(allAttendance);

            if (newAccumulatedMs >= FORTY_HOURS_MS) {
                setIsWeeklyTimerActive(false);
                addToast({ type: 'success', message: 'You have completed 40 hours for the week! 🎉' });
            }
            addToast({ type: 'success', message: 'Clocked out successfully! ✅' });
        } catch (error) {
            console.error('❌ Clock out error:', error);
            addToast({ type: 'error', message: 'Failed to clock out. Please try again.' });
        }
    }
  }, [currentUser, todayAttendanceRecord, employees, addToast, weeklyAccumulatedMs, isWeeklyTimerActive, previousAttendanceState]);

  // Undo clock action handler
  const handleUndoClockAction = useCallback(async () => {
    if (!currentUser || !undoAction || !previousAttendanceState) return;

    try {
      console.log(`🔄 Undoing ${undoAction}...`);
      
      const api = (await import('./services/api')).default;
      const todayStr = getLocalDateString();

      if (undoAction === 'clockIn') {
        // Delete the attendance record
        if (todayAttendanceRecord?.id) {
          await api.delete(`/attendance/${todayAttendanceRecord.id}`);
        }
        setTodayAttendanceRecord(null);
        setAttendanceRecords(prev => prev.filter(r => !(r.employeeId === currentUser.id && r.date === todayStr)));
        addToast({ type: 'info', message: 'Clock in undone successfully' });
      } else if (undoAction === 'clockOut') {
        // Restore the previous state (remove clock out)
        if (todayAttendanceRecord?.id) {
          await api.put(`/attendance/${todayAttendanceRecord.id}`, {
            clockOut: null,
            clockOutTimestamp: null,
            workHours: null,
            workMinutes: null
          });
        }
        setTodayAttendanceRecord(previousAttendanceState);
        setAttendanceRecords(prev => prev.map(r => 
          r.id === previousAttendanceState.id ? previousAttendanceState : r
        ));
        addToast({ type: 'info', message: 'Clock out undone successfully' });
      }

      // Reload attendance data
      const { attendanceService } = await import('./services/attendanceService');
      const allAttendance = await attendanceService.getAllAttendance();
      setAttendanceRecords(allAttendance);

      // Reset undo state
      setShowUndoNotification(false);
      setUndoAction(null);
      setPreviousAttendanceState(null);
      
      // ENHANCEMENT: Clear localStorage
      if (currentUser) {
        localStorage.removeItem(`undo_${currentUser.id}`);
      }
      
    } catch (error) {
      console.error('❌ Undo error:', error);
      addToast({ type: 'error', message: 'Failed to undo action' });
    }
  }, [currentUser, undoAction, previousAttendanceState, todayAttendanceRecord, addToast]);
  
  const handleAddNewUser = useCallback((newEmployee: Employee) => {
    const newUser: User = {
        id: newEmployee.id,
        name: newEmployee.name,
        email: newEmployee.email,
        role: UserRole.Employee, // New employees are always 'Employee' role
        avatarUrl: newEmployee.avatarUrl,
        isMfaSetup: false,
        mfaSecret: `SECRET_${Date.now()}`.split('').map(c => c.charCodeAt(0).toString(16)).join('').toUpperCase(), // Generate a mock secret
        password: 'password'
    };
    setUsers(prev => [...prev, newUser]);
  }, []);
  
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const renderContent = () => {
    if (!currentUser || authState !== 'authenticated') return null;

    // Find current employee record (handle both id and _id)
    const currentEmployee = employees.find(emp => emp.email === currentUser.email);
    const currentEmployeeId = currentEmployee?.id || (currentEmployee as any)?._id;
    
    const userLeaveBalance = currentEmployeeId 
      ? leaveBalances.find(b => b.employeeId === currentEmployeeId)?.balances || []
      : leaveBalances.find(b => b.employeeId === currentUser.id)?.balances || [];

    switch (activePage) {
      case 'Dashboard':
        return <DashboardPage user={currentUser} employees={employees} departments={departments} attendanceRecords={attendanceRecords} leaveRequests={leaveRequests} todayAttendanceRecord={todayAttendanceRecord} onClockIn={handleClockIn} onClockOut={handleClockOut} weeklyAccumulatedMs={weeklyAccumulatedMs} isWeeklyTimerActive={isWeeklyTimerActive} leaveBalances={userLeaveBalance} lastClockActionTime={lastClockActionTime} />;
      case 'Employees':
        return <EmployeesPage employees={employees} setEmployees={setEmployees} departments={departments} setLeaveBalances={setLeaveBalances} onAddNewUser={handleAddNewUser} />;
      case 'Departments':
        return <DepartmentsPage departments={departments} setDepartments={setDepartments} employees={employees} />;
      case 'Attendance':
        return <AttendancePage user={currentUser} records={attendanceRecords} setRecords={setAttendanceRecords} employees={employees} departments={departments} />;
      case 'My Leaves':
        return <LeavePage user={currentUser} leaveRequests={leaveRequests} onApplyLeave={handleApplyLeave} leaveBalances={userLeaveBalance} currentEmployeeId={currentEmployeeId} />;
      case 'Leave Requests':
        return <LeaveManagementPage leaveRequests={leaveRequests} onLeaveAction={handleLeaveAction} />;
      case 'Payroll':
        return <PayrollPage user={currentUser} payrollRecords={payrollRecords} setPayrollRecords={setPayrollRecords} employees={employees} departments={departments} attendanceRecords={attendanceRecords} />;
      case 'Reports':
        return <ReportsPage employees={employees} departments={departments} attendanceRecords={attendanceRecords} leaveRequests={leaveRequests} payrollRecords={payrollRecords} />;
      case 'Tasks':
        return <TasksPage user={currentUser} tasks={tasks} setTasks={setTasks} employees={employees} departments={departments} users={users} onTaskNotification={handleTaskNotification} />;
      case 'Notifications':
        return <NotificationsPage user={currentUser} notifications={notifications} setNotifications={setNotifications} setActivePage={setActivePage} />;
      case 'Profile':
        return <ProfilePage user={currentUser} onUpdateUser={(updatedUser) => setCurrentUser(u => ({...u, ...updatedUser} as User))} setActivePage={setActivePage} />;
      case 'Settings':
        return <SettingsPage user={currentUser} setActivePage={setActivePage} />;
      default:
        return <DashboardPage user={currentUser} employees={employees} departments={departments} attendanceRecords={attendanceRecords} leaveRequests={leaveRequests} todayAttendanceRecord={todayAttendanceRecord} onClockIn={handleClockIn} onClockOut={handleClockOut} weeklyAccumulatedMs={weeklyAccumulatedMs} isWeeklyTimerActive={isWeeklyTimerActive} leaveBalances={userLeaveBalance} lastClockActionTime={lastClockActionTime} />;
    }
  };

  if (authState === 'loggedOut') {
    return <LoginPage onLogin={handleLogin} users={users} />;
  }
  if (authState === 'needsMfaSetup' && currentUser) {
    return <MFASetupPage user={currentUser} onComplete={() => handleMfaComplete(true)} />;
  }
  if (authState === 'needsMfaVerification' && currentUser) {
    return (
      <MFAVerificationPage 
        user={currentUser} 
        onComplete={() => handleMfaComplete(false)}
        onMfaRecovery={handleMfaRecovery}
      />
    );
  }
  if (authState === 'captchaForReset' && currentUser) {
    return (
      <CaptchaVerificationPage 
        user={currentUser}
        onVerified={handleCaptchaVerifiedForReset}
        onBack={() => setAuthState('needsMfaVerification')}
      />
    );
  }
  if (authState === 'mfaRecovery') {
    return <MfaRecoveryPage onBack={() => setAuthState('loggedOut')} />;
  }

  return (
      <div className="bg-background text-foreground font-sans flex h-screen overflow-hidden">
        <Sidebar 
          currentUserRole={currentUser!.role} 
          activePage={activePage} 
          setActivePage={setActivePage}
          isOpen={isSidebarOpen}
          onClose={toggleSidebar}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar 
            user={currentUser!}
            onLogout={handleLogout}
            onToggleSidebar={toggleSidebar}
            setActivePage={setActivePage}
            notifications={notifications}
            setNotifications={setNotifications}
          />
          <main className="flex-1 overflow-y-auto p-6 lg:p-12">
            {renderContent()}
          </main>
        </div>
        
        {/* Undo Notification - ENHANCED: 5-minute undo window */}
        <UndoNotification
          isVisible={showUndoNotification}
          message={undoAction === 'clockIn' ? 'Clocked in successfully' : 'Clocked out successfully'}
          onUndo={handleUndoClockAction}
          onDismiss={() => {
            setShowUndoNotification(false);
            if (currentUser) {
              localStorage.removeItem(`undo_${currentUser.id}`);
            }
          }}
          duration={300}
          extendedMode={true}
        />
      </div>
  );
};

const App: React.FC = () => (
  <ToastProvider>
    <AppContent />
  </ToastProvider>
);

export default App;
