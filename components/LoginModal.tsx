import React, { useState } from 'react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<'employer' | 'helper'>('employer');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const body = isLogin ? { email, password } : { name, email, password, role };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error(`伺服器傳回錯誤 (${response.status})。請稍後再試。`);
            }

            const data = await response.json();

            if (response.ok) {
                if (isLogin) {
                    onLoginSuccess(data.user);
                    onClose();
                } else {
                    // Automatically log in after registration or tell user to log in
                    setIsLogin(true);
                    setError('註冊成功！請登入。');
                }
            } else {
                setError(data.error || (isLogin ? '登入失敗' : '註冊失敗'));
            }
        } catch (err: any) {
            setError(`${err.message || '未知錯誤'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold">{isLogin ? '歡迎回來' : '建立帳號'}</h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    {error && (
                        <div className={`p-3 rounded-lg text-sm font-medium ${error.includes('成功') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {error}
                        </div>
                    )}

                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">姓名</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-blue-500 outline-none"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="陳大文"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">我是...</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setRole('employer')}
                                        className={`p-3 rounded-xl border-2 transition font-bold ${role === 'employer' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'}`}
                                    >
                                        僱主 (搵姐姐)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('helper')}
                                        className={`p-3 rounded-xl border-2 transition font-bold ${role === 'helper' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'}`}
                                    >
                                        姐姐 (搵工)
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">電郵地址</label>
                        <input
                            type="email"
                            required
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-blue-500 outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@mail.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">密碼</label>
                        <input
                            type="password"
                            required
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-blue-500 outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="至少6位字元"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isLoading ? (isLogin ? '登入中...' : '註冊中...') : (isLogin ? '登入' : '註冊')}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-blue-600 font-medium hover:underline"
                        >
                            {isLogin ? '未有帳號？立即註冊' : '已有帳號？立即登入'}
                        </button>
                    </div>

                    {isLogin && (
                        <div className="text-center text-xs text-gray-400 pt-4">
                            測試帳號: admin@example.com / password123
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AuthModal;
