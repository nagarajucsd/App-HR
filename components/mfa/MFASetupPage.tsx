import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Label from '../common/Label';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/authService';

interface MFASetupPageProps {
  user: User;
  onComplete: () => void;
}

const MFASetupPage: React.FC<MFASetupPageProps> = ({ user, onComplete }) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    const setupMFA = async () => {
      try {
        const response = await authService.setupMFA(user.id);
        setQrCode(response.qrCode);
        setSecret(response.secret);
      } catch (error: any) {
        addToast({ type: 'error', message: 'Failed to setup MFA. Please try again.' });
      }
    };

    setupMFA();
  }, [user.id, addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('🔍 Attempting MFA setup verification with OTP:', otp);

    try {
      await authService.verifyMFA({
        userId: user.id,
        token: otp,
        isSetup: true
      });
      console.log('✅ MFA setup successful');
      addToast({ type: 'success', message: 'MFA setup complete! You can now use email verification as an alternative access method.' });
      onComplete();
    } catch (error: any) {
      console.error('❌ MFA setup failed:', error);
      addToast({ type: 'error', message: error.response?.data?.message || 'Invalid OTP. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card title="Set Up Two-Factor Authentication" className="w-full max-w-md">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Scan the QR code with your authenticator app (e.g., Google Authenticator).</p>
          {qrCode ? (
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <img src={qrCode} alt="MFA QR Code" />
            </div>
          ) : (
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <div className="w-48 h-48 bg-gray-200 animate-pulse rounded"></div>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Can't scan? Enter this secret key manually: <br />
            <strong className="font-mono">{secret}</strong>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              required
              maxLength={6}
              disabled={isLoading}
              className="text-center tracking-[0.5em]"
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify & Complete Setup'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default MFASetupPage;
