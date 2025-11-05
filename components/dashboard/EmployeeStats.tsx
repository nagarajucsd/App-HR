import React from 'react';
import { AttendanceRecord, AttendanceStatus, LeaveBalanceItem, LeaveType } from '../../types';
import Card from '../common/Card';

interface EmployeeStatsProps {
    attendanceRecords: AttendanceRecord[];
    leaveBalances: LeaveBalanceItem[];
}

const EmployeeStats: React.FC<EmployeeStatsProps> = ({ attendanceRecords, leaveBalances }) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyRecords = attendanceRecords.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });

    const presentDays = monthlyRecords.filter(r => r.status === AttendanceStatus.Present).length;
    const absentDays = monthlyRecords.filter(r => r.status === AttendanceStatus.Absent).length;
    const onLeaveDays = monthlyRecords.filter(r => r.status === AttendanceStatus.Leave).length;

    const stats = [
        { label: 'Present This Month', value: presentDays, color: 'text-success' },
        { label: 'Absent This Month', value: absentDays, color: 'text-destructive' },
        { label: 'On Leave This Month', value: onLeaveDays, color: 'text-blue-500' },
    ];
    
    return (
        <Card title="My Monthly Snapshot">
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                {stats.map(stat => (
                    <div key={stat.label}>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default EmployeeStats;