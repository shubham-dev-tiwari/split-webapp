import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const AuthFlow = ({ onComplete }) => {
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'signup') {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName }
                    }
                });
                if (signUpError) throw signUpError;
                // Supabase might require email confirmation, but for dev we'll proceed
                alert("Account created successfully! You can now log in.");
                setMode('login');
            } else {
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (signInError) throw signInError;
                onComplete(data.user);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-black text-white tracking-tight">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-subtext text-sm">
                    {mode === 'login' ? 'Log in to manage your group expenses' : 'Create an account to start tracking shared costs'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-subtext group-focus-within:text-lavender transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-surface0 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-lavender/50 transition-all"
                            required
                        />
                    </div>
                )}

                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-subtext group-focus-within:text-lavender transition-colors" size={20} />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-surface0 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-lavender/50 transition-all"
                        required
                    />
                </div>

                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-subtext group-focus-within:text-lavender transition-colors" size={20} />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-surface0 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-lavender/50 transition-all"
                        required
                    />
                </div>

                {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs font-bold text-center">
                        {error}
                    </motion.p>
                )}

                <button
                    disabled={loading}
                    className="w-full bg-lavender text-crust font-bold py-4 rounded-2xl shadow-xl shadow-lavender/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                        <>
                            {mode === 'login' ? 'Log In' : 'Sign Up'} <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </form>

            <div className="text-center">
                <button
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-lavender font-bold text-sm hover:underline"
                >
                    {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log In'}
                </button>
            </div>
        </div>
    );
};

export default AuthFlow;
