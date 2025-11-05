import React from 'react';
import { LeaveBalanceItem } from '../../types';
import Card from '../common/Card';

interface LeaveBalanceCardProps {
  balances: LeaveBalanceItem[];
}

const ProgressBar: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full bg-secondary rounded-full h-2.5">
      <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

const LeaveBalanceCard: React.FC<LeaveBalanceCardProps> = ({ balances }) => {
  const colorMap = ['bg-blue-600', 'bg-emerald-500', 'bg-amber-500', 'bg-gray-500'];
  
  // Calculate total leaves taken across all types
  const totalLeavesTaken = balances.reduce((total, balance) => total + balance.used, 0);
  const totalPending = balances.reduce((total, balance) => total + balance.pending, 0);

  return (
    <Card title="Leave Count">
      <div className="space-y-6">
        {/* Total Summary */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-amber-800">Total Leaves Taken</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{totalLeavesTaken} days</p>
            </div>
            {totalPending > 0 && (
              <div className="text-right">
                <p className="text-xs text-amber-700">Pending</p>
                <p className="text-xl font-semibold text-amber-600">{totalPending}</p>
              </div>
            )}
          </div>
        </div>

        {/* Breakdown by Type */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-muted-foreground">Breakdown by Type</p>
          {balances.map((balance, index) => {
            return (
              <div key={balance.type} className="border-l-4 pl-3" style={{ borderColor: colorMap[index % colorMap.length].replace('bg-', '#') }}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-medium text-foreground">{balance.type}</span>
                  <span className="text-sm font-bold text-foreground">{balance.used} <span className="font-normal text-muted-foreground">used</span></span>
                </div>
                {balance.pending > 0 && (
                  <div className="text-xs text-amber-600 mt-1">
                    {balance.pending} pending approval
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default LeaveBalanceCard;