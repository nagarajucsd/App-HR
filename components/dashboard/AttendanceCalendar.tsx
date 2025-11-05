import React, { useState } from 'react';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import Card from '../common/Card';
import Select from '../common/Select';

const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ records }) => {
  // Always start with current month/year
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Debug logging
  React.useEffect(() => {
    console.log('📅 AttendanceCalendar Debug:');
    console.log('   Total records received:', records.length);
    console.log('   Current month:', months[month], '(index:', month, ')');
    console.log('   Current year:', year);
    
    // Show sample of records
    if (records.length > 0) {
      console.log('   Sample records:', records.slice(0, 3).map(r => ({
        date: r.date,
        status: r.status,
        employeeId: typeof r.employeeId === 'object' ? r.employeeId._id : r.employeeId
      })));
    }
    
    // Filter records for current month/year
    const thisMonthRecords = records.filter(r => {
      const recordDate = r.date.includes('T') ? r.date.split('T')[0] : r.date;
      const [recordYear, recordMonth] = recordDate.split('-').map(Number);
      return recordMonth === (month + 1) && recordYear === year;
    });
    
    console.log('   Records for', months[month], year, ':', thisMonthRecords.length);
    if (thisMonthRecords.length > 0) {
      console.log('   Sample:', thisMonthRecords.slice(0, 3).map(r => `${r.date}: ${r.status}`));
    }
  }, [records, month, year]);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(new Date(year, parseInt(e.target.value), 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(new Date(parseInt(e.target.value), month, 1));
  };
  
  const getStatusForDay = (day: number): AttendanceStatus | undefined => {
    // Create date string in YYYY-MM-DD format
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Find matching record
    const record = records.find(r => {
      // Handle both date formats
      const recordDate = r.date.includes('T') ? r.date.split('T')[0] : r.date;
      return recordDate === dateString;
    });
    
    // Debug log for first few days
    if (day <= 3) {
      console.log(`   Day ${day} (${dateString}):`, record ? `${record.status}` : 'No record');
    }
    
    return record?.status;
  };

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="border-r border-b border-border"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isToday = new Date().toDateString() === date.toDateString();
    const isFutureDate = date > new Date(); // Check if date is in the future
    
    let cellClasses = 'h-12 flex items-center justify-center text-sm border-r border-b border-border transition-colors';
    let textClasses = 'relative w-8 h-8 flex items-center justify-center rounded-full';
    
    // Don't show attendance status for future dates
    const status = isFutureDate ? undefined : getStatusForDay(day);

    if (isFutureDate) {
      // Future dates should be grayed out and not show attendance
      textClasses += ' text-muted-foreground opacity-50';
      cellClasses += ' bg-muted/20';
    } else if (status === AttendanceStatus.Present) {
      textClasses += ' bg-emerald-100 text-emerald-800 font-semibold';
    } else if (status === AttendanceStatus.Absent) {
      textClasses += ' bg-red-100 text-red-800 font-semibold';
    } else if (status === AttendanceStatus.Leave || status === AttendanceStatus.HalfDay) {
      textClasses += ' bg-amber-100 text-amber-800 font-semibold';
    } else if (isWeekend) {
      cellClasses += ' bg-secondary';
      textClasses += ' text-muted-foreground';
    } else {
      textClasses += ' text-foreground';
    }
    
    if (isToday) {
      textClasses += ' ring-2 ring-primary ring-offset-2 ring-offset-card';
    }
    
    calendarDays.push(
      <div key={day} className={cellClasses}>
        <span className={textClasses}>
            {day}
        </span>
      </div>
    );
  }

  // Clean up borders for a proper grid look
  for (let i = 6; i < calendarDays.length; i += 7) {
    if (React.isValidElement(calendarDays[i])) {
      const { props } = calendarDays[i] as React.ReactElement<any>;
      calendarDays[i] = React.cloneElement(calendarDays[i] as React.ReactElement<any>, { className: `${props.className} border-r-0` });
    }
  }

  return (
    <Card title="Attendance Overview" bodyClassName="p-4" className="h-full">
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex gap-2 items-center flex-1">
          <Select value={month} onChange={handleMonthChange} className="h-9 text-sm">
            {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </Select>
          <Select value={year} onChange={handleYearChange} className="h-9 text-sm">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-7 border-t border-l border-border rounded-lg overflow-hidden">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center font-medium text-xs text-muted-foreground py-2 border-r border-b border-border bg-secondary">
            {day}
          </div>
        ))}
        {calendarDays}
      </div>
       <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground px-2">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-100 border border-emerald-200 rounded-sm"></div> Present</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-100 border border-red-200 rounded-sm"></div> Absent</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-100 border border-amber-200 rounded-sm"></div> On Leave</div>
       </div>
    </Card>
  );
};

export default AttendanceCalendar;