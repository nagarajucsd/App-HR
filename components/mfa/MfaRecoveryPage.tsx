import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Label from '../common/Label';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/authService';
import Icon from '../common/Icon';

interface MfaRecoveryPageProps {
  onBack: () => void;
}

const MfaRecoveryPage: React.FC<MfaRecoveryPageProps> = ({ onBack }) => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔍 Requesting MFA recovery code for:', email);
      const response = await authService.requestEmailVerificationCode(email);
      console.log('✅ Verification code sent');
      
      setStep('code');
      addToast({ type: 'success', message: response.message });
    } catch (error: any) {
      console.error('❌ Failed to send verification code:', error);
      addToast({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to send verification code' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔍 Verifying code and resetting MFA for:', email);
      const response = await authService.verifyEmailCode(email, verificationCode, true);
      console.log('✅ MFA reset successful');
      
      addToast({ type: 'success', message: 'MFA reset successful! Please login again.' });
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error: any) {
      console.error('❌ Code verification failed:', error);
      addToast({ 
        type: 'error', 
        message: error.response?.data?.message || 'Invalid verification code' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Code entry step
  if (step === 'code') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="key" className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Enter Verification Code</h2>
              <p className="text-muted-foreground">
                We've sent a 6-digit code to <strong>{email}</strong>
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Icon name="info" className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Check Your Email</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Enter the 6-digit code we sent to your email. The code expires in 10 minutes.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  required
                  disabled={isLoading}
                  icon="key"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || verificationCode.length !== 6}>
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying & Resetting MFA...
                  </span>
                ) : (
                  'Verify Code & Reset MFA'
                )}
              </Button>

              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setStep('email')} 
                className="w-full"
                disabled={isLoading}
              >
                Back to Email Entry
              </Button>
            </form>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="shield" className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">MFA Recovery</h2>
            <p className="text-muted-foreground">
              Lost access to your authenticator? We'll help you recover your account.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Icon name="info" className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 font-medium">Recovery Process</p>
                <p className="text-sm text-blue-700 mt-1">
                  Enter your email address and we'll send you a secure recovery link to reset your MFA settings.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Icon name="alert-triangle" className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-800 font-medium">Security Notice</p>
                <p className="text-sm text-amber-700 mt-1">
                  This will reset your MFA settings. You'll need to set up MFA again after recovery.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email address"
                required
                disabled={isLoading}
                icon="mail"
              />
              <p className="text-xs text-muted-foreground mt-1">
                We'll send a 6-digit verification code to this email address
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !email}>
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Verification Code...
                </span>
              ) : (
                'Send Verification Code'
              )}
            </Button>

            <Button 
              type="button" 
              variant="secondary" 
              onClick={onBack} 
              className="w-full"
              disabled={isLoading}
            >
              Back to Login
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default MfaRecoveryPage;