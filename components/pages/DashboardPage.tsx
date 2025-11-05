import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { EmployeeStatus, LeaveStatus, AttendanceStatus, User, UserRole, AttendanceRecord, Employee, Department, LeaveRequest, LeaveBalanceItem } from '../../types';
import ActivityFeed from '../dashboard/ActivityFeed';
import DepartmentDistribution from '../dashboard/DepartmentDistribution';
import Icon, { IconName } from '../common/Icon';
import AttendanceCalendar from '../dashboard/AttendanceCalendar';
import EmployeeStats from '../dashboard/EmployeeStats';
import WelcomeCard from '../dashboard/WelcomeCard';
import { employeeService } from '../../services/employeeService';
import { departmentService } from '../../services/departmentService';
import { leaveService } from '../../services/leaveService';
import { attendanceService } from '../../services/attendanceService';
import { useToast } from '../../hooks/useToast';
import { getLocalDateString } from '../../utils/dateUtils';

interface DashboardPageProps {
  user: User;
  employees: Employee[];
  departments: Department[];
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  todayAttendanceRecord: AttendanceRecord | null;
  onClockIn: () => void;
  onClockOut: () => void;
  weeklyAccumulatedMs: number;
  isWeeklyTimerActive: boolean;
  leaveBalances: LeaveBalanceItem[];
  lastClockActionTime?: number;
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    const animationDuration = 1000; // 1 second
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(animationDuration / frameDuration);
    const step = value / totalFrames;

    let currentFrame = 0;
    const counter = setInterval(() => {
      currentFrame++;
      const nextValue = Math.min(value, Math.round(step * currentFrame));
      setCurrentValue(nextValue);
      if (currentFrame === totalFrames) {
        clearInterval(counter);
        setCurrentValue(value); // Ensure it ends on the exact value
      }
    }, frameDuration);

    return () => clearInterval(counter);
  }, [value]);

  return <>{currentValue.toLocaleString()}</>;
};

interface StatCardProps {
  title: string;
  value: number;
  icon: IconName;
  iconBgClass: string;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, iconBgClass, suffix='' }) => (
  <Card className="relative overflow-hidden group">
    <div className={`absolute -top-4 -right-4 w-24 h-24 flex items-center justify-center rounded-lg ${iconBgClass} bg-opacity-10 text-lg transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12`}>
        <Icon name={icon} className={`h-10 w-10 ${iconBgClass.replace('bg-','text-')} opacity-30`} />
    </div>
    <div className="p-6">
      <p className="text-base font-medium text-muted-foreground">{title}</p>
      <p className="text-5xl font-bold text-foreground mt-2">
        <AnimatedNumber value={value} />
        {suffix}
      </p>
    </div>
  </Card>
);

const AdminDashboard: React.FC<DashboardPageProps> = ({ user, employees, departments, attendanceRecords, leaveRequests }) => {
    const [apiEmployees, setApiEmployees] = useState<Employee[]>(employees);
    const [apiDepartments, setApiDepartments] = useState<Department[]>(departments);
    const [apiLeaveRequests, setApiLeaveRequests] = useState<LeaveRequest[]>(leaveRequests);
    const [apiAttendanceRecords, setApiAttendanceRecords] = useState<AttendanceRecord[]>(attendanceRecords);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    // Load real-time data from API
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                console.log('🔍 Loading dashboard data from API...');
                setIsLoading(true);
                
                const [employeesData, departmentsData, leaveRequestsData, attendanceData] = await Promise.all([
                    employeeService.getAllEmployees().catch(() => employees),
                    departmentService.getAllDepartments().catch(() => departments),
                    leaveService.getAllLeaveRequests().catch(() => leaveRequests),
                    attendanceService.getAllAttendance().catch(() => attendanceRecords)
                ]);

                setApiEmployees(employeesData);
                setApiDepartments(departmentsData);
                setApiLeaveRequests(leaveRequestsData);
                setApiAttendanceRecords(attendanceData);
                
                console.log('✅ Dashboard data loaded successfully');
            } catch (error: any) {
                console.error('❌ Failed to load dashboard data:', error);
                // Use fallback data
                setApiEmployees(employees);
                setApiDepartments(departments);
                setApiLeaveRequests(leaveRequests);
                setApiAttendanceRecords(attendanceRecords);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
        
        // Refresh data every 3 seconds for REAL-TIME updates
        const interval = setInterval(loadDashboardData, 3 * 1000);
        return () => clearInterval(interval);
    }, []); // Empty dependency array - only load once and use interval for updates

    const activeEmployees = apiEmployees.filter(e => e.status === EmployeeStatus.Active).length;
    const pendingLeaves = apiLeaveRequests.filter(lr => lr.status === LeaveStatus.Pending).length;
    const todayDate = getLocalDateString();
    const presentToday = apiAttendanceRecords.filter(a => a.status === AttendanceStatus.Present && a.date === todayDate).length;
    
    // Ensure percentage is between 0-100
    const presentPercentage = activeEmployees > 0 ? Math.min(100, Math.max(0, Math.round((presentToday / activeEmployees) * 100))) : 0;
    
    return (
        <div className="space-y-10">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">Welcome back, {user.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground mt-2 text-lg">Here's a snapshot of your organization today.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Active Employees" value={activeEmployees} icon="users" iconBgClass="bg-blue-500" />
            <StatCard title="Departments" value={apiDepartments.length} icon="briefcase" iconBgClass="bg-purple-500" />
            <StatCard title="Present Today" value={presentPercentage} icon="check" iconBgClass="bg-emerald-500" suffix="%" />
            <StatCard title="Pending Leaves" value={pendingLeaves} icon="calendar" iconBgClass="bg-amber-500" />
          </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-1 h-full">
                <AttendanceCalendar records={apiAttendanceRecords} />
             </div>
             <div className="lg:col-span-1 h-full">
                <ActivityFeed />
             </div>
             <div className="lg:col-span-1 h-full">
               <DepartmentDistribution employees={apiEmployees} departments={apiDepartments}/>
             </div>
           </div>
        </div>
    );
};

const EmployeeDashboard: React.FC<DashboardPageProps> = (props) => {
    const { user, attendanceRecords, leaveBalances, employees } = props;
    
    // Find the employee record for this user
    const currentEmployee = employees.find(emp => emp.email === user.email || emp.userId === user.id);
    const employeeId = currentEmployee?.id || currentEmployee?._id || user.id;
    
    // Filter attendance by employee ID (not user ID)
    const userAttendance = attendanceRecords.filter(a => {
      const recordEmployeeId = typeof a.employeeId === 'object' 
        ? (a.employeeId._id || a.employeeId.id) 
        : a.employeeId;
      return recordEmployeeId === employeeId || recordEmployeeId === user.id;
    });
    
    console.log('👤 Employee Dashboard:', {
      userId: user.id,
      employeeId: employeeId,
      totalAttendanceRecords: attendanceRecords.length,
      userAttendanceRecords: userAttendance.length
    });
    
    return (
         <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                 <WelcomeCard {...props} />
              </div>
               <EmployeeStats attendanceRecords={userAttendance} leaveBalances={leaveBalances} />
            </div>
            <div>
                <AttendanceCalendar records={userAttendance} />
            </div>
        </div>
    );
};

const DashboardPage: React.FC<DashboardPageProps> = (props) => {
  const isEmployee = props.user.role === UserRole.Employee;

  if (isEmployee) {
    return <EmployeeDashboard {...props} />;
  }

  // Admin, HR, Manager
  return <AdminDashboard {...props} />;
};

export default DashboardPage;