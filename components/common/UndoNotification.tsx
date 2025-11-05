import React, { useEffect, useState } from 'react';
import Button from './Button';

interface UndoNotificationProps {
  isVisible: boolean;
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number; // in seconds
  extendedMode?: boolean; // ENHANCEMENT: Show extended undo window (5 minutes)
}

const UndoNotification: React.FC<UndoNotificationProps> = ({
  isVisible,
  message,
  onUndo,
  onDismiss,
  duration = 10,
  extendedMode = false
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  
  // ENHANCEMENT: Format time for extended mode (show minutes:seconds)
  const formatTime = (seconds: number) => {
    if (!extendedMode || seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!isVisible) {
      setTimeLeft(duration);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onDismiss();
          return duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, duration, onDismiss]);

  if (!isVisible) return null;

  const progress = (timeLeft / duration) * 100;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="bg-card border-2 border-primary shadow-2xl rounded-lg overflow-hidden max-w-md">
        <div className="p-4 flex items-center space-x-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{message}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {extendedMode ? `Undo available for ${formatTime(timeLeft)}` : `Auto-dismiss in ${formatTime(timeLeft)}`}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onUndo}
              className="whitespace-nowrap"
            >
              ↶ Undo
            </Button>
            <button
              onClick={onDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default UndoNotification;
