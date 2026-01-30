import React from 'react';
import { ArrowRight, Bell, Scan, Moon, Share2, MessageCircle, ShieldCheck } from 'lucide-react';
import { PRESETS } from '@/lib/constants';

const FeatureCard = ({ title, desc, icon }) => (
    <div className="bg-surface0 p-6 rounded-3xl border border-white/5 space-y-4 h-full flex flex-col">
        <div className="w-full h-44 bg-surface1 rounded-2xl flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-surface0/80 to-transparent" />
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-subtext text-sm leading-relaxed">{desc}</p>
        </div>
    </div>
);

const Landing = ({ onStart }) => (
    <div className="flex flex-col bg-crust min-h-screen relative">

        <main className="w-full mx-auto pb-32 space-y-20 md:max-w-7xl md:px-6">
            <section className="text-center space-y-8 pt-12 md:text-left md:flex md:items-center md:justify-between md:gap-12 md:pt-24 px-6 md:px-0">
                <div className="space-y-8 md:flex-1 md:space-y-10">
                    <div className="space-y-4 md:space-y-6">
                        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-lavender leading-[1.1] tracking-tight">
                            Simplified Group <br />Expenses.
                        </h1>
                        <p className="text-subtext text-lg md:text-xl leading-relaxed max-w-[280px] md:max-w-lg mx-auto md:mx-0">
                            Professional digital ledger for automated settlement and group spending tracking.
                        </p>
                    </div>

                    <button
                        onClick={onStart}
                        className="bg-lavender text-crust font-bold py-4 px-10 rounded-full text-lg shadow-xl shadow-lavender/20 active:scale-95 transition-all hover:scale-105"
                    >
                        Get Started
                    </button>
                </div>

                {/* Device Mockup */}
                <div className="relative mt-8 md:mt-0 w-full aspect-[9/16] max-w-[280px] md:max-w-[320px] lg:max-w-[360px] mx-auto md:mx-0 rounded-[3rem] border-[8px] border-surface1 bg-surface0 overflow-hidden shadow-2xl transition-transform duration-500 md:mr-12">
                    <div className="p-6 flex flex-col gap-6 h-full bg-gradient-to-b from-surface0 to-base text-left">
                        <div className="flex justify-between items-center">
                            <div className="w-10 h-10 rounded-full bg-surface1"></div>
                            <Bell size={20} className="text-lavender" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-subtext uppercase tracking-widest font-bold">Total Balance</p>
                            <h3 className="text-3xl font-black text-white">₹0.00</h3>
                        </div>
                        <div className="flex gap-2">
                            {PRESETS.map(p => (
                                <div key={p.id} className={`px-2 py-1 rounded-full border ${p.border} ${p.bg} flex items-center gap-1`}>
                                    <div className={p.color}>{React.cloneElement(p.icon, { size: 10 })}</div>
                                    <span className={`text-[8px] font-bold ${p.color}`}>{p.name}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex flex-col gap-3">
                            {[1, 2].map(i => (
                                <div key={i} className="p-3 bg-surface1/30 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-surface1 rounded-lg"></div>
                                        <div className="h-1.5 w-16 bg-surface1 rounded"></div>
                                    </div>
                                    <div className="h-1.5 w-8 bg-lavender/50 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-10 px-6 md:px-0">
                <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight mb-2">Automated Group Settlements</h2>
                    <div className="h-1 w-12 bg-lavender mx-auto rounded-full"></div>
                </div>

                <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
                    <FeatureCard
                        title="Smart Ledgering"
                        desc="Easily track group spending and settle balances with clarity."
                        icon={<div className="flex gap-2">
                            {PRESETS.map(p => (
                                <div key={p.id} className="h-10 px-4 rounded-full bg-crust border border-white/5 flex items-center gap-2">
                                    <span className={p.color}>{p.icon}</span>
                                    <span className="text-xs font-bold">{p.name}</span>
                                </div>
                            ))}
                        </div>}
                    />
                    <FeatureCard
                        title="Real-time Tracking"
                        desc="Stay updated on shared expenses as they happen."
                        icon={<div className="relative group">
                            <div className="w-24 h-32 bg-crust rounded-lg border-2 border-lavender/20 flex flex-col p-3 gap-2 rotate-12 shadow-xl group-hover:rotate-6 transition-transform">
                                <div className="w-full h-1 bg-lavender/10 rounded" />
                                <div className="w-2/3 h-1 bg-lavender/10 rounded" />
                                <div className="mt-auto h-2 w-full bg-lavender rounded" />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Scan size={48} className="text-lavender" />
                            </div>
                        </div>}
                    />
                    <FeatureCard
                        title="Secure & Reliable"
                        desc="Transparent ledger management for all your collective expenses."
                        icon={<div className="flex flex-col items-center gap-3">
                            <Moon size={40} className="text-lavender" />
                            <div className="flex gap-1.5">
                                {['#f5e0dc', '#cba6f7', '#89b4fa', '#a6e3a1'].map(c => (
                                    <div key={c} className="w-4 h-4 rounded-full" style={{ backgroundColor: c }} />
                                ))}
                            </div>
                        </div>}
                    />
                </div>
            </section>

            <footer className="text-center space-y-8 pt-12 border-t border-white/5 md:flex md:justify-between md:items-center md:space-y-0 md:pb-12 md:text-left px-6 md:px-0">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-subtext/50 mb-2">Developed for excellence</p>
                    <p className="text-[10px] text-subtext/30">© 2024 Lekha Jokha. All rights reserved.</p>
                </div>
                <div className="flex justify-center md:justify-end gap-8 text-subtext">
                    <Share2 className="hover:text-lavender cursor-pointer" size={20} />
                    <MessageCircle className="hover:text-lavender cursor-pointer" size={20} />
                    <ShieldCheck className="hover:text-lavender cursor-pointer" size={20} />
                </div>
            </footer>
        </main>

        <div className="fixed bottom-0 left-0 right-0 p-6 z-[60] md:hidden">
            <div className="max-w-md mx-auto">
                <button
                    onClick={onStart}
                    className="w-full bg-lavender/10 backdrop-blur-xl text-lavender border border-lavender/20 font-bold py-4 rounded-full flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl"
                >
                    Start your Ledger <ArrowRight size={18} />
                </button>
            </div>
        </div>
    </div>
);

export default Landing;
