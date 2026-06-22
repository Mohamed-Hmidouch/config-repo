import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LockKey, User, CircleNotch } from '@phosphor-icons/react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      login(data.access_token);
      navigate('/');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F1EC] flex items-center justify-center font-sans p-6">
      <div className="bg-white rounded-[32px] p-10 w-full max-w-md shadow-lg border border-gray-100">
        <div className="w-16 h-16 bg-[#F5F7F6] rounded-2xl flex items-center justify-center mb-6 text-[#1F2937]">
          <LockKey size={32} weight="duotone" />
        </div>
        <h1 className="text-3xl font-bold text-[#1F2937] mb-2">Welcome Back</h1>
        <p className="text-gray-500 mb-8 font-medium">Please sign in to confirm invoices.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 font-medium text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#1F2937] mb-2">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <User size={20} weight="fill" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#F5F7F6] border-2 border-transparent focus:border-[#D97757] focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-[#1F2937] font-medium outline-none transition-all"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1F2937] mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <LockKey size={20} weight="fill" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F5F7F6] border-2 border-transparent focus:border-[#D97757] focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-[#1F2937] font-medium outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1F2937] hover:bg-black text-white font-bold rounded-2xl py-4 transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <CircleNotch size={24} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
