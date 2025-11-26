import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { ArrowLeft } from 'lucide-react';

export const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin + '/dashboard',
            }
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
            // Auto-login após registro
            setTimeout(() => navigate('/dashboard'), 2000);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-gray-300 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-bold text-white">Criar Conta</h2>
                    <div className="w-5"></div>
                </div>

                <div className="flex flex-col items-center mb-8">
                    <img src={logo} alt="Santamérica" className="w-20 h-20 mb-4 drop-shadow-md" />
                    <p className="text-gray-300 text-sm text-center">Registre-se para acessar o Santadeck</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-500/20 border border-green-500 text-green-100 p-3 rounded-lg text-sm text-center">
                            ✅ Conta criada! Redirecionando...
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                        <p className="text-xs text-gray-400 mt-1">Mínimo 6 caracteres</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || success}
                        className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-red-900 font-bold rounded-full shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Criando conta...' : success ? 'Conta criada!' : 'Criar Conta'}
                    </button>
                </form>
            </div>
        </div>
    );
};
