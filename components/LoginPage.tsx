import React, { useState } from 'react';
import { User } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import Input from './common/Input';
import Label from './common/Label';
import Icon from './common/Icon';
import { authService } from '../services/authService';

interface LoginPageProps {
    onLogin: (user: User) => void;
    users: User[];
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, users }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        console.log('🔍 Attempting login with:', { email, password: '***' });

        try {
            const response = await authService.login({ email, password });
            console.log('✅ Login API response:', response);
            console.log('✅ User data:', response.user);
            
            // Convert role string to UserRole enum if needed
            const user = {
                ...response.user,
                role: response.user.role as any, // Type assertion to handle string to enum
            };
            
            console.log('✅ Processed user:', user);
            onLogin(user);
        } catch (error: any) {
            console.error('❌ Login failed:', error);
            console.error('❌ Error response:', error.response);
            console.error('❌ Error data:', error.response?.data);
            setError(error.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md space-y-8">
                 <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="text-white w-full h-full">
                                <path d="M2.5 7.5L5 15h14l2.5-7.5L19 10l-4-6.5-3 4.5-3-4.5L5 10l-2.5-2.5zM5 17h14v2H5v-2z"/>
                            </svg>
                        </div>
                        <h1 className="text-5xl font-extrabold text-foreground tracking-tight">
                            WEintegrity
                        </h1>
                    </div>
                     <p className="text-muted-foreground mt-3 text-lg">Sign in to the future of HR management</p>
                </div>
                <Card bodyClassName="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="bg-destructive/20 border border-destructive/30 text-destructive px-4 py-3 rounded-md text-sm">{error}</div>}
                        
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                type="email"
                                id="email"
                                icon="mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    icon="lock"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                    className="pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                                    title={showPassword ? "Hide password" : "Show password"}
                                    disabled={isLoading}
                                >
                                    <Icon name={showPassword ? "eye-off" : "eye"} className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
