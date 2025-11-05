import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Icon from '../common/Icon';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';
import { AttendanceRecord } from '../../types';

interface LiveWorkTimerProps {
  record: AttendanceRecord;
  onClockIn: () => void;
  onClockOut: () => void;
  weeklyAccumulatedMs: number;
  isWeeklyTimerActive: boolean;
  lastActionTime?: number; // Timestamp of last clock action
}

const formatMillisecondsToHHMMSS = (ms: number) => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const LiveWorkTimer: React.FC<LiveWorkTimerProps> = ({ record, onClockIn, onClockOut, weeklyAccumulatedMs, isWeeklyTimerActive, lastActionTime }) => {
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [showClockInConfirm, setShowClockInConfirm] = useState(false);
  const [showClockOutConfirm, setShowClockOutConfirm] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [pausedTime, setPausedTime] = useState<string | null>(null);
  
  const isClockedOut = !!record.clockOut;
  const isClockedIn = !!record.clockIn && !record.clockOut; // Clocked in but not out
  const FORTY_HOURS_MS = 40 * 60 * 60 * 1000;
  const COOLDOWN_SECONDS = 5; // 5 second cooldown between actions
  const INITIAL_OFFSET_MS = 0; // Timer starts at 00:00:00 - only begins when user clicks Clock In

  // Cooldown timer effect
  useEffect(() => {
    if (!lastActionTime) return;
    
    const updateCooldown = () => {
      const now = Date.now();
      const elapsed = (now - lastActionTime) / 1000;
      const remaining = Math.max(0, COOLDOWN_SECONDS - elapsed);
      setCooldownRemaining(Math.ceil(remaining));
    };
    
    updateCooldown();
    const cooldownTimer = setInterval(updateCooldown, 100);
    
    return () => clearInterval(cooldownTimer);
  }, [lastActionTime, COOLDOWN_SECONDS]);

  useEffect(() => {
    if (isClockedOut) {
      // If clocked out, show the paused time (final session time)
      if (record.clockInTimestamp && record.clockOutTimestamp) {
        const clockInTime = new Date(record.clockInTimestamp).getTime();
        const clockOutTime = new Date(record.clockOutTimestamp).getTime();
        const sessionDurationMs = clockOutTime - clockInTime + INITIAL_OFFSET_MS;
        const pausedTimeStr = formatMillisecondsToHHMMSS(sessionDurationMs);
        setPausedTime(pausedTimeStr);
        setElapsedTime(pausedTimeStr);
      } else if (record.workHours) {
        setPausedTime(record.workHours);
        setElapsedTime(record.workHours);
      }
      setWeeklyProgress(Math.min(100, (weeklyAccumulatedMs / FORTY_HOURS_MS) * 100));
      return;
    }

    if (!record.clockIn) {
      setElapsedTime('00:00:00');
      setWeeklyProgress(0);
      setPausedTime(null);
      return;
    }

    // Use clockInTimestamp if available, otherwise parse clockIn string
    let clockInTime: number;
    if (record.clockInTimestamp) {
      clockInTime = new Date(record.clockInTimestamp).getTime();
    } else {
      const [time, modifier] = record.clockIn.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      const [year, month, day] = record.date.split('-').map(Number);
      const clockInDate = new Date(year, month - 1, day, hours, minutes);
      clockInTime = clockInDate.getTime();
    }

    const updateDisplayTime = () => {
        const now = Date.now();
        // Calculate today's session duration starting from 00:00:40
        const sessionDurationMs = Math.max(0, now - clockInTime) + INITIAL_OFFSET_MS;
        
        // For display: show today's session time with initial offset
        setElapsedTime(formatMillisecondsToHHMMSS(sessionDurationMs));
        
        // For weekly progress: add today's session to accumulated time
        const totalMs = isWeeklyTimerActive ? weeklyAccumulatedMs + sessionDurationMs : weeklyAccumulatedMs;
        setWeeklyProgress(Math.min(100, (totalMs / FORTY_HOURS_MS) * 100));
    };
    
    updateDisplayTime();
    const timerId = setInterval(updateDisplayTime, 1000);

    return () => clearInterval(timerId);
  }, [record.clockIn, record.clockInTimestamp, record.clockOut, record.clockOutTimestamp, record.workHours, weeklyAccumulatedMs, isWeeklyTimerActive, record.date, isClockedOut, FORTY_HOURS_MS, INITIAL_OFFSET_MS]);

  const handleClockInClick = () => {
    if (cooldownRemaining > 0) return;
    setShowClockInConfirm(true);
  };

  const handleClockOutClick = () => {
    if (cooldownRemaining > 0) return;
    setShowClockOutConfirm(true);
  };

  const confirmClockIn = () => {
    setShowClockInConfirm(false);
    onClockIn();
  };

  const confirmClockOut = () => {
    setShowClockOutConfirm(false);
    onClockOut();
  };

  const titleText = isClockedOut 
      ? 'Today\'s Work Hours (Paused)' 
      : 'Today\'s Work Hours (Live)';
  
  const weeklyHours = (weeklyProgress / 100) * 40;
  const isOnCooldown = cooldownRemaining > 0;
      
  return (
    <>
      <Card>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className={`flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-full ${isClockedOut ? 'bg-amber-500/10' : 'bg-success/10'} relative`}>
                <Icon name="clock" className={`h-8 w-8 ${isClockedOut ? 'text-amber-500' : 'text-success'}`} />
                {isClockedOut && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                {/* Show both clock-in and clock-out times */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Clock In: {record.clockIn || 'Not clocked in'}
                  </p>
                  {record.clockOut && (
                    <p className="text-sm font-medium text-muted-foreground">
                      Clock Out: {record.clockOut}
                    </p>
                  )}
                </div>
                <div className="flex items-baseline space-x-2 mt-2">
                  <p className="text-4xl font-bold text-foreground tracking-wider">{elapsedTime}</p>
                  {isClockedOut && pausedTime && (
                    <span className="text-sm font-medium text-amber-500 animate-pulse">⏸ PAUSED</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{titleText}</p>
                {isClockedOut && pausedTime && (
                  <p className="text-xs text-amber-600 mt-1">
                    Timer paused at {pausedTime} - Clock in again to resume
                  </p>
                )}
              </div>
            </div>
            {/* Clock action buttons with cooldown - ENHANCED: Better mobile layout */}
            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
              <Button 
                variant="default" 
                size="lg" 
                onClick={handleClockInClick}
                disabled={isOnCooldown || isClockedIn}
                title={
                  isClockedIn ? "Already clocked in today - will reset tomorrow" :
                  isOnCooldown ? `Please wait ${cooldownRemaining}s before next action` : 
                  "Clock in for today"
                }
                className="relative flex-1 md:flex-none md:min-w-[140px]"
              >
                {isClockedIn ? (
                  <>🔒 Clocked In</>
                ) : isOnCooldown ? (
                  <>⏳ Wait {cooldownRemaining}s</>
                ) : (
                  <>🕐 Clock In</>
                )}
              </Button>
              <Button 
                variant="destructive" 
                size="lg" 
                onClick={handleClockOutClick}
                title={isOnCooldown ? `Please wait ${cooldownRemaining}s before next action` : "Clock out"}
                disabled={isClockedOut || !record.clockIn || isOnCooldown}
                className="relative flex-1 md:flex-none md:min-w-[140px]"
              >
                {isOnCooldown ? (
                  <>⏳ Wait {cooldownRemaining}s</>
                ) : (
                  <>🕐 Clock Out</>
                )}
              </Button>
            </div>
          </div>
          
          {/* Clock In Locked Notice */}
          {isClockedIn && !isClockedOut && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-sm text-blue-700">
                🔒 Clock In button is locked for today. You've already clocked in at {record.clockIn}. It will reset tomorrow.
              </p>
            </div>
          )}
          
          {/* Cooldown warning */}
          {isOnCooldown && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center space-x-2">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-amber-700">
                Please wait {cooldownRemaining} second{cooldownRemaining !== 1 ? 's' : ''} before your next clock action to prevent accidental clicks.
              </p>
            </div>
          )}
        
          {/* Weekly Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Weekly Goal Progress</span>
              <span className="font-semibold">{weeklyHours.toFixed(1)} / 40 hours ({weeklyProgress.toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  weeklyProgress >= 100 ? 'bg-green-500' : 
                  weeklyProgress >= 75 ? 'bg-blue-500' : 
                  weeklyProgress >= 50 ? 'bg-yellow-500' : 
                  'bg-orange-500'
                }`}
                style={{ width: `${weeklyProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {weeklyProgress >= 100 
                ? '🎉 Weekly goal completed!' 
                : `${(40 - weeklyHours).toFixed(1)} hours remaining to reach 40-hour goal`
              }
            </p>
          </div>
        </div>
      </Card>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showClockInConfirm}
        title="Confirm Clock In"
        message="Are you sure you want to clock in? Your work timer will start immediately."
        confirmText="Yes, Clock In"
        cancelText="Cancel"
        onConfirm={confirmClockIn}
        onCancel={() => setShowClockInConfirm(false)}
        variant="default"
      />

      <ConfirmDialog
        isOpen={showClockOutConfirm}
        title="Confirm Clock Out"
        message="Are you sure you want to clock out? This will pause your work timer and record your hours for today."
        confirmText="Yes, Clock Out"
        cancelText="Cancel"
        onConfirm={confirmClockOut}
        onCancel={() => setShowClockOutConfirm(false)}
        variant="warning"
      />
    </>
  );
};

export default LiveWorkTimer;
