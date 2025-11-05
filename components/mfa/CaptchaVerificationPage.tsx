import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';
import Label from '../common/Label';

interface CaptchaVerificationPageProps {
  user: User;
  onVerified: () => void;
  onBack: () => void;
}

// Generate random CAPTCHA text (6 characters: letters and numbers)
const generateCaptcha = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars like I, 1, O, 0
  let captchaText = '';
  for (let i = 0; i < 6; i++) {
    captchaText += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return {
    text: captchaText,
    displayText: captchaText.split('').join(' ') // Add spaces for readability
  };
};

const CaptchaVerificationPage: React.FC<CaptchaVerificationPageProps> = ({ user, onVerified, onBack }) => {
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  useEffect(() => {
    if (isLocked && lockTimer > 0) {
      const timer = setTimeout(() => {
        setLockTimer(lockTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isLocked && lockTimer === 0) {
      setIsLocked(false);
      setAttempts(0);
      refreshCaptcha();
    }
  }, [isLocked, lockTimer]);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setUserAnswer('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLocked) {
      setError(`Too many failed attempts. Please wait ${lockTimer} seconds.`);
      return;
    }

    const userInput = userAnswer.trim().toUpperCase();
    
    if (!userInput) {
      setError('Please enter the CAPTCHA code');
      return;
    }

    if (userInput === captcha.text) {
      console.log('✅ CAPTCHA verified successfully');
      
      // Call API to reset MFA
      try {
        const response = await fetch('/api/auth/mfa/reset-with-captcha', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            captchaAnswer: userInput
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          console.log('✅ MFA reset successful');
          onVerified();
        } else {
          setError(data.message || 'Failed to reset MFA. Please try again.');
        }
      } catch (error) {
        console.error('❌ MFA reset error:', error);
        setError('Network error. Please try again.');
      }
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setIsLocked(true);
        setLockTimer(30); // 30 seconds lockout
        setError('Too many failed attempts. Locked for 30 seconds.');
      } else {
        setError(`Incorrect CAPTCHA code. ${3 - newAttempts} attempts remaining.`);
        refreshCaptcha();
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="text-white w-full h-full">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
            </div>
            <h1 className="text-5xl font-extrabold text-foreground tracking-tight">
              WEintegrity
            </h1>
          </div>
          <p className="text-muted-foreground mt-3 text-lg">Security Verification</p>
        </div>

        <Card bodyClassName="p-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Reset MFA Authentication</h2>
            <p className="text-muted-foreground">
              Hello, <span className="font-semibold text-foreground">{user.name}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              To reset your MFA, please verify you're human by solving the math problem below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/20 border border-destructive/30 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* CAPTCHA Display */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-lg border-2 border-border shadow-inner">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">Enter the code below:</p>
                <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-400 mb-4 select-none">
                  <div 
                    className="text-5xl font-bold my-2 font-mono tracking-widest"
                    style={{
                      color: '#333',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                      letterSpacing: '0.3em',
                      transform: 'skewX(-5deg)',
                      userSelect: 'none'
                    }}
                  >
                    {captcha.displayText}
                  </div>
                  <div className="flex justify-center space-x-1 mt-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  disabled={isLocked}
                  className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh Code</span>
                </button>
              </div>
            </div>

            {/* Answer Input */}
            <div className="space-y-2">
              <Label htmlFor="answer">Enter CAPTCHA Code</Label>
              <Input
                type="text"
                id="answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
                placeholder="Enter the code above"
                required
                disabled={isLocked}
                autoFocus
                maxLength={6}
                className="text-center text-2xl font-bold tracking-widest uppercase"
              />
              <p className="text-xs text-muted-foreground text-center">
                Enter the 6-character code shown above (not case-sensitive)
              </p>
            </div>

            {/* Attempts Counter */}
            {attempts > 0 && !isLocked && (
              <div className="text-center text-sm text-muted-foreground">
                Attempts: {attempts}/3
              </div>
            )}

            {/* Lock Timer */}
            {isLocked && (
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-destructive/20 text-destructive px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-semibold">Locked: {lockTimer}s</span>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLocked || !userAnswer}
              >
                {isLocked ? `Locked (${lockTimer}s)` : 'Verify & Continue'}
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                className="w-full" 
                onClick={onBack}
              >
                ← Back to MFA Verification
              </Button>
            </div>
          </form>
        </Card>

        {/* Info Card */}
        <Card className="text-sm text-muted-foreground" bodyClassName="p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-foreground mb-1">MFA Reset Security</p>
              <p>This CAPTCHA verification ensures that only you can reset your MFA. After verification, your current MFA will be removed and you'll set up a new one.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CaptchaVerificationPage;
