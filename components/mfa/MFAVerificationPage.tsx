import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Label from '../common/Label';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/authService';
import Icon from '../common/Icon';

interface MFAVerificationPageProps {
  user: { id: string; email: string };
  onComplete: () => void;
  onMfaRecovery?: () => void;
}

const MFAVerificationPage: React.FC<MFAVerificationPageProps> = ({ user, onComplete, onMfaRecovery }) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔍 Attempting MFA verification with OTP:', otp);
      await authService.verifyMFA({
        userId: user.id,
        token: otp,
        isSetup: false
      });
      console.log('✅ MFA verification successful');
      onComplete();
    } catch (error: any) {
      console.error('❌ MFA verification failed:', error);
      addToast({ type: 'error', message: error.response?.data?.message || 'Invalid OTP. Please try again.' });
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="shield" className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Two-Factor Verification</h2>
            <p className="text-muted-foreground">
              Enter the 6-digit code from your authenticator app.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="otp" className="sr-only">Verification Code</Label>
              <Input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="_ _ _ _ _ _"
                required
                maxLength={6}
                disabled={isLoading}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                autoComplete="one-time-code"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>

          </form>

          <div className="text-center space-y-2 mt-4">
            {onMfaRecovery && (
              <div>
                <button
                  type="button"
                  onClick={onMfaRecovery}
                  className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                  disabled={isLoading}
                >
                  Lost access to your authenticator? Reset MFA
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MFAVerificationPage;
