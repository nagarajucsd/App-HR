import React from 'react';
import LeaveApplyForm from './leave/LeaveApplyForm';
import LeaveHistoryTable from './leave/LeaveHistoryTable';
import LeaveBalanceCard from './leave/LeaveBalanceCard';
import HolidayList from './leave/HolidayList';
import { LeaveRequest, LeaveBalanceItem, Holiday, User } from '../types';
import { upcomingHolidays as mockHolidays } from '../data/mockData';

interface LeavePageProps {
    user: User;
    leaveRequests: LeaveRequest[];
    onApplyLeave: (newRequest: Omit<LeaveRequest, 'id' | 'status' | 'days' | 'employeeId' | 'employeeName'>) => void;
    leaveBalances: LeaveBalanceItem[];
}

const LeavePage: React.FC<LeavePageProps> = ({ user, leaveRequests, onApplyLeave, leaveBalances }) => {
  const userLeaveRequests = leaveRequests.filter(r => r.employeeId === user.id);

  return (
      <div>
        <h1 className="text-3xl font-bold text-card-foreground mb-6">My Leaves</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <LeaveApplyForm onApplyLeave={onApplyLeave} leaveBalances={leaveBalances}/>
            <LeaveHistoryTable requests={userLeaveRequests} />
          </div>
          <div className="space-y-8">
            <LeaveBalanceCard balances={leaveBalances} />
            <HolidayList holidays={mockHolidays} />
          </div>
        </div>
      </div>
  );
};

export default LeavePage;