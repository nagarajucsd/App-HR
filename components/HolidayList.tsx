
import React from 'react';
import { Holiday } from '../types';
import Card from './common/Card';

interface HolidayListProps {
  holidays: Holiday[];
}

const HolidayList: React.FC<HolidayListProps> = ({ holidays }) => {
  return (
    <Card title="Upcoming Holidays">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {holidays.map((holiday) => (
          <li key={holiday.date} className="py-3 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{holiday.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(holiday.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default HolidayList;
