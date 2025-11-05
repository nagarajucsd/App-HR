import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord } from '../../types';
import LiveWorkTimer from './LiveWorkTimer';
import Card from '../common/Card';

interface WelcomeCardProps {
    user: User;
    todayAttendanceRecord: AttendanceRecord | null;
    onClockIn: () => void;
    onClockOut: () => void;
    weeklyAccumulatedMs: number;
    isWeeklyTimerActive: boolean;
    lastClockActionTime?: number;
}

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

const WelcomeCard: React.FC<WelcomeCardProps> = (props) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const isClockedIn = props.todayAttendanceRecord && !!props.todayAttendanceRecord.clockIn && !props.todayAttendanceRecord.clockOut;

    return (
        <Card className="h-full flex flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/80 to-blue-500/80 !border-primary/20 text-white shadow-xl shadow-primary/20">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-4xl font-extrabold">{getGreeting()}, {props.user.name.split(' ')[0]}!</h2>
                        <p className="mt-2 text-lg opacity-80">Ready for a productive day?</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-5xl font-bold tracking-wider">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="opacity-80">{time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
            </div>
            <div className="mt-8">
                 {props.todayAttendanceRecord ? (
                    <div className="bg-black/20 rounded-xl">
                        <LiveWorkTimer {...props} record={props.todayAttendanceRecord} lastActionTime={props.lastClockActionTime} />
                    </div>
                 ) : (
                    <div className="bg-black/20 rounded-xl p-6 text-center">
                        <p className="text-lg mb-4">Ready to start your workday?</p>
                        <button
                            onClick={props.onClockIn}
                            className="px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            🕐 Clock In
                        </button>
                    </div>
                 )}
            </div>
        </Card>
    );
};

export default WelcomeCard;
