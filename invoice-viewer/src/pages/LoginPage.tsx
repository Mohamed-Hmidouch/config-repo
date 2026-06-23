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
      setError("Nom d'utilisateur ou mot de passe invalide");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans p-6">
      <div className="bg-white rounded-xl p-10 w-full max-w-md shadow-lg border border-gray-100">
        <div className="w-16 h-16 bg-[#0EA5E9]/10 rounded-lg flex items-center justify-center mb-6 text-[#0EA5E9]">
          <LockKey size={32} weight="bold" />
        </div>
        <h1 className="text-3xl font-bold text-[#0EA5E9] mb-2">Bon retour</h1>
        <p className="text-gray-500 mb-8 font-medium">Veuillez vous connecter pour valider les factures.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 font-medium text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nom d'utilisateur</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <User size={20} weight="bold" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#FFFFFF] border-2 border-transparent focus:border-[#0EA5E9] focus:bg-white rounded-lg py-4 pl-12 pr-4 text-slate-800 font-medium outline-none transition-all shadow-sm"
                placeholder="Entrez votre nom d'utilisateur"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Mot de passe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <LockKey size={20} weight="bold" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FFFFFF] border-2 border-transparent focus:border-[#0EA5E9] focus:bg-white rounded-lg py-4 pl-12 pr-4 text-slate-800 font-medium outline-none transition-all shadow-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold rounded-lg py-4 transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? <CircleNotch size={24} className="animate-spin" /> : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};
