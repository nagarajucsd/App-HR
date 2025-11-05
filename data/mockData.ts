// FIX: Replaced mock data generation with a version that has a consistent and correct data structure, particularly for payroll records.
// The import from '../types' is now valid because types.ts has been corrected.
import { User, Employee, Department, LeaveRequest, AttendanceRecord, PayrollRecord, LeaveBalance, Holiday, UserRole, LeaveStatus, LeaveType, EmployeeStatus, EmployeeType, AttendanceStatus, PayrollStatus, Notification } from '../types';
import { generateAvatar } from '../utils/avatar';

export const mockUsers: User[] = [
    { id: 'usr_admin', name: 'Alex Admin', email: 'admin@hrms.com', role: UserRole.Admin, avatarUrl: generateAvatar('Alex Admin'), isMfaSetup: false, mfaSecret: 'JBSWY3DPEHPK3PXP', password: 'password123' },
    { id: 'usr_hr', name: 'Harriet HR', email: 'hr@hrms.com', role: UserRole.HR, avatarUrl: generateAvatar('Harriet HR'), isMfaSetup: false, mfaSecret: 'KRSXG5CTMVRXEZL1', password: 'password123' },
    { id: 'usr_manager', name: 'Mandy Manager', email: 'manager@hrms.com', role: UserRole.Manager, avatarUrl: generateAvatar('Mandy Manager'), isMfaSetup: false, mfaSecret: 'LBSWY3DPEHPK3PXP', password: 'password123' },
    { id: 'usr_employee', name: 'Eva Employee', email: 'employee@hrms.com', role: UserRole.Employee, avatarUrl: generateAvatar('Eva Employee'), isMfaSetup: false, mfaSecret: 'MBRWG5CTMVRXEZL2', password: 'password123' },
];

export const mockDepartments: Department[] = [
    { id: 'dept01', name: 'Engineering', managerId: 'usr_manager' }, // Assigned manager for demo
    { id: 'dept02', name: 'Human Resources', managerId: 'usr_hr' },
    { id: 'dept03', name: 'Sales', managerId: 'emp003' },
    { id: 'dept04', name: 'Marketing' },
];

export const mockEmployees: Employee[] = [
    { id: 'emp001', employeeId: 'EMP001', name: 'John Doe', email: 'john.doe@example.com', phone: '123-456-7890', avatarUrl: generateAvatar('John Doe'), departmentId: 'dept01', role: 'Lead Engineer', joinDate: '2022-08-15', status: EmployeeStatus.Active, employeeType: EmployeeType.Permanent, salary: 95000 },
    { id: 'emp002', employeeId: 'EMP002', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '234-567-8901', avatarUrl: generateAvatar('Jane Smith'), departmentId: 'dept02', role: 'HR Manager', joinDate: '2021-05-20', status: EmployeeStatus.Active, employeeType: EmployeeType.Permanent, salary: 85000 },
    { id: 'emp003', employeeId: 'EMP003', name: 'Peter Jones', email: 'peter.jones@example.com', phone: '345-678-9012', avatarUrl: generateAvatar('Peter Jones'), departmentId: 'dept03', role: 'Sales Lead', joinDate: '2023-01-10', status: EmployeeStatus.Active, employeeType: EmployeeType.Permanent, salary: 80000 },
    { id: 'usr_employee', employeeId: 'EMP004', name: 'Eva Employee', email: 'employee@hrms.com', phone: '456-789-0123', avatarUrl: generateAvatar('Eva Employee'), departmentId: 'dept01', role: 'Software Engineer', joinDate: '2023-03-12', status: EmployeeStatus.Active, employeeType: EmployeeType.Permanent, salary: 75000 },
    { id: 'emp005', employeeId: 'EMP005', name: 'Chris Lee', email: 'chris.lee@example.com', phone: '567-890-1234', avatarUrl: generateAvatar('Chris Lee'), departmentId: 'dept01', role: 'UI/UX Designer', joinDate: '2022-11-25', status: EmployeeStatus.Inactive, employeeType: EmployeeType.Contract, salary: 70000 },
    { id: 'usr_admin', employeeId: 'ADM001', name: 'Alex Admin', email: 'admin@hrms.com', phone: '555-ADMIN', avatarUrl: generateAvatar('Alex Admin'), departmentId: 'dept02', role: 'System Administrator', joinDate: '2020-01-01', status: EmployeeStatus.Active, employeeType: EmployeeType.Permanent, salary: 110000 },
    { id: 'usr_hr', employeeId: 'HR001', name: 'Harriet HR', email: 'hr@hrms.com', phone: '555-HR', avatarUrl: generateAvatar('Harriet HR'), departmentId: 'dept02', role: 'Senior HR Generalist', joinDate: '2021-02-15', status: EmployeeStatus.Active, employeeType: EmployeeType.Permanent, salary: 78000 },
    { id: 'usr_manager', employeeId: 'MGR001', name: 'Mandy Manager', email: 'manager@hrms.com', phone: '555-MANAGER', avatarUrl: generateAvatar('Mandy Manager'), departmentId: 'dept01', role: 'Engineering Manager', joinDate: '2021-09-01', status: EmployeeStatus.Active, employeeType: EmployeeType.Permanent, salary: 105000 },
];

// --- STATIC DATA ---
export const upcomingHolidays: Holiday[] = [
    { date: '2025-12-25', name: 'Christmas Day' },
    { date: '2026-01-01', name: 'New Year\'s Day' },
    { date: '2026-01-26', name: 'Republic Day' },
];

// --- DYNAMIC DATA GENERATION ---

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const todayDate = today.getDate();

const formatDate = (d: Date): string => d.toISOString().split('T')[0];
const formatTime = (d: Date): string => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

const randomTime = (date: Date, startHour: number, endHour: number): Date => {
    const d = new Date(date);
    const hour = startHour + Math.random() * (endHour - startHour);
    const minute = Math.random() * 60;
    d.setHours(hour, minute, 0, 0);
    return d;
};

const generatedAttendance: AttendanceRecord[] = [];
const generatedLeaveRequests: LeaveRequest[] = [];

// Per-employee leave balance generation (unlimited)
export const initialLeaveBalances: LeaveBalance[] = mockEmployees.map(emp => ({
    employeeId: emp.id,
    balances: [
        { type: LeaveType.Annual, total: 999, used: Math.floor(Math.random() * 5), pending: 0 },
        { type: LeaveType.Sick, total: 999, used: Math.floor(Math.random() * 3), pending: 0 },
        { type: LeaveType.Casual, total: 999, used: Math.floor(Math.random() * 2), pending: 0 },
        { type: LeaveType.Unpaid, total: 999, used: 0, pending: 0 },
    ],
}));

mockEmployees.filter(e => e.status === EmployeeStatus.Active).forEach(employee => {
    for (let i = 30; i >= 1; i--) {
        const date = new Date(currentYear, currentMonth, todayDate - i);
        if (date > today) continue;
        
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        const randomFactor = Math.random();
        let status: AttendanceStatus;
        
        if (employee.role.includes('Manager') || employee.role.includes('HR') || employee.role.includes('Admin')) {
             if (randomFactor < 0.03) status = AttendanceStatus.Leave;
             else if (randomFactor < 0.05) status = AttendanceStatus.Absent;
             else status = AttendanceStatus.Present;
        } else {
             if (randomFactor < 0.08) status = AttendanceStatus.Leave;
             else if (randomFactor < 0.13) status = AttendanceStatus.Absent;
             else status = AttendanceStatus.Present;
        }

        const recordDateStr = formatDate(date);

        if (status === AttendanceStatus.Present) {
            const clockInDate = randomTime(date, 8.75, 9.5);
            const clockOutDate = randomTime(date, 17, 18);
            const workMs = clockOutDate.getTime() - clockInDate.getTime();
            const workHours = Math.floor(workMs / 3600000);
            const workMinutes = Math.floor((workMs % 3600000) / 60000);
            generatedAttendance.push({
                id: `att-${employee.id}-${recordDateStr}`, employeeId: employee.id, date: recordDateStr, status,
                clockIn: formatTime(clockInDate), clockOut: formatTime(clockOutDate),
                workHours: `${String(workHours).padStart(2, '0')}:${String(workMinutes).padStart(2, '0')}:00`,
            });
        } else if (status === AttendanceStatus.Leave) {
            generatedAttendance.push({ id: `att-${employee.id}-${recordDateStr}`, employeeId: employee.id, date: recordDateStr, status });
            generatedLeaveRequests.push({
                id: `lr-gen-${employee.id}-${recordDateStr}`, employeeId: employee.id, employeeName: employee.name,
                leaveType: Math.random() > 0.5 ? LeaveType.Sick : LeaveType.Casual,
                startDate: recordDateStr, endDate: recordDateStr, reason: 'Personal commitment',
                status: LeaveStatus.Approved, days: 1,
            });
        } else {
            generatedAttendance.push({ id: `att-${employee.id}-${recordDateStr}`, employeeId: employee.id, date: recordDateStr, status });
        }
    }
});

const todayRecordsForDemo: AttendanceRecord[] = mockEmployees
    .filter(e => e.role !== UserRole.Employee && e.status === EmployeeStatus.Active)
    .map(e => ({
        id: `att-today-${e.id}`, employeeId: e.id, date: formatDate(today), status: AttendanceStatus.Present,
        clockIn: formatTime(randomTime(today, 8.5, 9.25))
    }));

export const mockAttendance: AttendanceRecord[] = [...generatedAttendance, ...todayRecordsForDemo];

const pendingLeaves: LeaveRequest[] = [
  { id: 'lr-pending-1', employeeId: 'emp003', employeeName: 'Peter Jones', leaveType: LeaveType.Casual, startDate: formatDate(new Date(today.getTime() + 5 * 86400000)), endDate: formatDate(new Date(today.getTime() + 5 * 86400000)), reason: 'Bank work', status: LeaveStatus.Pending, days: 1 },
  { id: 'lr-pending-2', employeeId: 'usr_employee', employeeName: 'Eva Employee', leaveType: LeaveType.Annual, startDate: formatDate(new Date(today.getTime() + 10 * 86400000)), endDate: formatDate(new Date(today.getTime() + 12 * 86400000)), reason: 'Personal trip', status: LeaveStatus.Pending, days: 3 },
];

// Add pending days to balances
pendingLeaves.forEach(req => {
    const balanceRecord = initialLeaveBalances.find(b => b.employeeId === req.employeeId);
    if (balanceRecord) {
        const balanceItem = balanceRecord.balances.find(bi => bi.type === req.leaveType);
        if (balanceItem) {
            balanceItem.pending += req.days;
        }
    }
});

export const mockLeaveRequests: LeaveRequest[] = [...generatedLeaveRequests, ...pendingLeaves];

const getWeekIdentifier = (d: Date): string => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date.toISOString().split('T')[0];
};

export const mockUserWeeklyProgress: Record<string, { accumulatedMs: number, weekIdentifier: string }> = {};
const currentWeekId = getWeekIdentifier(today);
mockEmployees.forEach(employee => {
    const weekStartDate = new Date(currentWeekId);
    let accumulatedMs = 0;
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStartDate);
        date.setDate(weekStartDate.getDate() + i);
        if (date >= today) break;
        const record = generatedAttendance.find(r => r.employeeId === employee.id && r.date === formatDate(date) && r.workHours);
        if (record && record.workHours) {
            const [h, m] = record.workHours.split(':').map(Number);
            accumulatedMs += (h * 3600000) + (m * 60000);
        }
    }
    mockUserWeeklyProgress[employee.id] = { accumulatedMs, weekIdentifier: currentWeekId };
});

const lastMonthDate = new Date();
lastMonthDate.setDate(1);
lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
const lastMonthYear = lastMonthDate.getFullYear();
const lastMonthIndex = lastMonthDate.getMonth();

// Updated Payroll Generation with new structure
export const mockPayroll: PayrollRecord[] = mockEmployees.filter(e => e.status === EmployeeStatus.Active).map((emp, index) => {
    const grossPay = emp.salary / 12;
    const basic = grossPay * 0.5; // 50% of gross
    const hra = basic * 0.4; // 40% of basic
    const special = grossPay - basic - hra;

    const absentDays = generatedAttendance.filter(r => 
        r.employeeId === emp.id && 
        new Date(r.date).getMonth() === lastMonthIndex && 
        new Date(r.date).getFullYear() === lastMonthYear && 
        r.status === AttendanceStatus.Absent
    ).length;

    const absenceDeduction = absentDays * (grossPay / 22);
    const providentFund = basic * 0.12;
    const tax = grossPay > 5000 ? (grossPay - 5000) * 0.1 : 0; // Simple tax calc

    const totalDeductions = absenceDeduction + providentFund + tax;
    const netPay = grossPay - totalDeductions;
    
    return {
        id: `pay-${emp.id}-${lastMonthIndex}`,
        employeeId: emp.id,
        month: lastMonthIndex,
        year: lastMonthYear,
        basic: parseFloat(basic.toFixed(2)),
        allowances: {
            hra: parseFloat(hra.toFixed(2)),
            special: parseFloat(special.toFixed(2)),
        },
        deductions: {
            tax: parseFloat(tax.toFixed(2)),
            providentFund: parseFloat(providentFund.toFixed(2)),
            absence: parseFloat(absenceDeduction.toFixed(2)),
        },
        grossPay: parseFloat(grossPay.toFixed(2)),
        netPay: parseFloat(netPay.toFixed(2)),
        status: index % 2 === 0 ? PayrollStatus.Paid : PayrollStatus.Generated,
    };
});


export const mockNotifications: Notification[] = [
    { id: 'notif001', userId: 'user1', title: 'New Company Policy', message: 'A new work-from-home policy has been published.', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), read: false },
    { id: 'notif002', userId: 'user1', title: 'Leave Request Approved', message: 'Your annual leave has been approved.', timestamp: new Date(Date.now() - 22 * 3600000).toISOString(), read: false, link: 'My Leaves' },
    { id: 'notif003', userId: 'user1', title: 'Payroll Generated', message: `Your payslip for ${lastMonthDate.toLocaleString('default', { month: 'long' })} has been generated.`, timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), read: true, link: 'Payroll' },
    { id: 'notif004', userId: 'user1', title: 'Upcoming Holiday', message: 'The office will be closed on 2025-12-25 for Christmas Day.', timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), read: true },
];