import React, { useState, useEffect } from 'react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (user: any) => void;
}

type AuthState = 'login' | 'register' | 'forgot-password' | 'reset-password';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [authState, setAuthState] = useState<AuthState>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<'employer' | 'helper'>('employer');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const roleRef = React.useRef(role);

    // Keep ref updated for Google callback
    useEffect(() => {
        roleRef.current = role;
    }, [role]);

    // Initialize Google Login
    useEffect(() => {
        if (isOpen && (authState === 'login' || authState === 'register')) {
            const timer = setTimeout(() => {
                const google = (window as any).google;
                if (google && google.accounts && google.accounts.id) {
                    google.accounts.id.initialize({
                        // IMPORTANT: User must replace this with their actual Google Client ID
                        client_id: "776945037563-vhv8j6k4j3j7j6k4j3j7j6k4j3j7.apps.googleusercontent.com",
                        callback: handleGoogleResponse
                    });

                    const btnContainer = document.getElementById("googleSignInDiv");
                    if (btnContainer) {
                        google.accounts.id.renderButton(
                            btnContainer,
                            { theme: "outline", size: "large", width: "100%", text: authState === 'register' ? "signup_with" : "signin_with" }
                        );
                    }
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen, authState]);

    const handleGoogleResponse = async (response: any) => {
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch('/api/oauth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    credential: response.credential,
                    role: roleRef.current // Use the LATEST role from ref
                })
            });
            const data = await res.json();
            if (res.ok) {
                onLoginSuccess(data.user);
                onClose();
            } else {
                setError(data.error || 'Google login failed');
            }
        } catch (err: any) {
            setError(err.message || 'System error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        let endpoint = '';
        let body = {};

        switch (authState) {
            case 'login':
                endpoint = '/api/auth/login';
                body = { email, password };
                break;
            case 'register':
                endpoint = '/api/auth/register';
                body = { name, email, password, role };
                break;
            case 'forgot-password':
                endpoint = '/api/oauth/forgot-password';
                body = { email };
                break;
            case 'reset-password':
                endpoint = '/api/oauth/reset-password';
                body = { token: resetToken, newPassword };
                break;
        }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                if (authState === 'login') {
                    onLoginSuccess(data.user);
                    onClose();
                } else if (authState === 'register') {
                    // Automatically log in after registration
                    const loginRes = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });
                    const loginData = await loginRes.json();
                    if (loginRes.ok) {
                        onLoginSuccess(loginData.user);
                        onClose();
                    } else {
                        setAuthState('login');
                        setMessage('Registration successful! Please login with your password.');
                    }
                } else if (authState === 'forgot-password') {
                    setMessage(data.message || 'Reset link sent to your email.');
                    // For dev purposes, if we get a token back, we could automatically switch to reset view
                    if (data.devToken) {
                        console.log('Dev Token:', data.devToken);
                        setResetToken(data.devToken);
                        // setAuthState('reset-password'); // Or let user click link
                    }
                } else if (authState === 'reset-password') {
                    setAuthState('login');
                    setMessage('Password reset successful! Please login with your new password.');
                }
            } else {
                setError(data.error || 'Request failed');
            }
        } catch (err: any) {
            setError(`${err.message || 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const renderHeader = () => {
        switch (authState) {
            case 'login': return 'Welcome Back';
            case 'register': return 'Create Account';
            case 'forgot-password': return 'Forgot Password';
            case 'reset-password': return 'Reset Password';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold">{renderHeader()}</h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg text-sm font-medium bg-red-50 text-red-600">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="p-3 rounded-lg text-sm font-medium bg-green-50 text-green-600">
                            {message}
                        </div>
                    )}

                    {(authState === 'login' || authState === 'register') && (
                        <>
                            <div id="googleSignInDiv" className="flex justify-center mb-2"></div>
                            <div className="relative flex items-center gap-2 py-2">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="text-xs text-gray-400 font-medium">OR</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>
                        </>
                    )}

                    {authState === 'register' && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-blue-500 outline-none"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">I am an...</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setRole('employer')}
                                        className={`p-3 rounded-xl border-2 transition font-bold ${role === 'employer' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'}`}
                                    >
                                        Employer
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('helper')}
                                        className={`p-3 rounded-xl border-2 transition font-bold ${role === 'helper' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'}`}
                                    >
                                        Helper
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {(authState === 'login' || authState === 'register' || authState === 'forgot-password') && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-blue-500 outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@mail.com"
                            />
                        </div>
                    )}

                    {(authState === 'login' || authState === 'register') && (
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="block text-sm font-bold text-gray-700">Password</label>
                                {authState === 'login' && (
                                    <button
                                        type="button"
                                        onClick={() => setAuthState('forgot-password')}
                                        className="text-xs text-blue-600 hover:underline"
                                    >
                                        Forgot Password?
                                    </button>
                                )}
                            </div>
                            <input
                                type="password"
                                required
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-blue-500 outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 6 characters"
                            />
                        </div>
                    )}

                    {authState === 'reset-password' && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Reset Token</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-blue-500 outline-none"
                                    value={resetToken}
                                    onChange={(e) => setResetToken(e.target.value)}
                                    placeholder="Enter your token"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-blue-500 outline-none"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="At least 6 characters"
                                />
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isLoading ? 'Processing...' : (
                            authState === 'login' ? 'Login' :
                                authState === 'register' ? 'Register' :
                                    authState === 'forgot-password' ? 'Send Reset Link' : 'Update Password'
                        )}
                    </button>

                    <div className="text-center">
                        {(authState === 'login' || authState === 'register') ? (
                            <button
                                type="button"
                                onClick={() => setAuthState(authState === 'login' ? 'register' : 'login')}
                                className="text-sm text-blue-600 font-medium hover:underline"
                            >
                                {authState === 'login' ? "Don't have an account? Register now" : 'Already have an account? Login now'}
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => setAuthState('login')}
                                    className="text-sm text-blue-600 font-medium hover:underline"
                                >
                                    Back to Login
                                </button>
                                {authState === 'forgot-password' && (
                                    <button
                                        type="button"
                                        onClick={() => setAuthState('reset-password')}
                                        className="block mx-auto text-xs text-gray-500 hover:underline"
                                    >
                                        Already have a token?
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;
