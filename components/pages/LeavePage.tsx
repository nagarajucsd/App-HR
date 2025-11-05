import React from 'react';
import LeaveApplyForm from '../leave/LeaveApplyForm';
import LeaveHistoryTable from '../leave/LeaveHistoryTable';
import HolidayList from '../leave/HolidayList';
import { LeaveRequest, LeaveBalanceItem, Holiday, User } from '../../types';
import { upcomingHolidays as mockHolidays } from '../../data/mockData';

interface LeavePageProps {
    user: User;
    leaveRequests: LeaveRequest[];
    onApplyLeave: (newRequest: Omit<LeaveRequest, 'id' | 'status' | 'days' | 'employeeId' | 'employeeName'>) => void;
    leaveBalances: LeaveBalanceItem[];
    currentEmployeeId?: string;
}

const LeavePage: React.FC<LeavePageProps> = ({ user, leaveRequests, onApplyLeave, leaveBalances, currentEmployeeId }) => {
  // Filter by employee ID if provided, otherwise try to match by user email
  const userLeaveRequests = leaveRequests.filter(r => {
    if (currentEmployeeId) {
      // Handle both string and object employeeId, and both id and _id
      const requestEmpId = typeof r.employeeId === 'object' 
        ? ((r.employeeId as any)._id || (r.employeeId as any).id) 
        : r.employeeId;
      return requestEmpId === currentEmployeeId || requestEmpId === user.id;
    }
    // Fallback: try to match by employeeName or user.id
    const requestEmpId = typeof r.employeeId === 'object' 
      ? ((r.employeeId as any)._id || (r.employeeId as any).id) 
      : r.employeeId;
    return requestEmpId === user.id || r.employeeName === user.name;
  });

  return (
      <div>
        <h1 className="text-3xl font-bold text-card-foreground mb-6">My Leaves</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <LeaveApplyForm onApplyLeave={onApplyLeave} leaveBalances={leaveBalances}/>
            <LeaveHistoryTable requests={userLeaveRequests} />
          </div>
          <div className="space-y-8">
            <HolidayList holidays={mockHolidays} />
          </div>
        </div>
      </div>
  );
};

export default LeavePage;