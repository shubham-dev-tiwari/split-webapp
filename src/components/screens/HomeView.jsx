import React from 'react';
import { motion } from 'framer-motion';
import { Bell, ChevronRight, Plus } from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';

import { useAppStore } from '@/store/useAppStore';

const HomeView = ({ groups, balance, onSelectGroup }) => {
    const { expenses, currentUser } = useAppStore();

    // Calculate 7-day history
    const history = React.useMemo(() => {
        if (!currentUser) return Array(7).fill(0);

        const days = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            d.setHours(23, 59, 59, 999);
            days.push(d);
        }

        return days.map(dayEnd => {
            let dailyBalance = 0;
            expenses.forEach(exp => {
                if (new Date(exp.created_at) > dayEnd) return;

                const splitList = exp.split_list || [];
                const shareCount = splitList.length || 1;
                const share = exp.amount / shareCount;

                if (exp.payer_id === currentUser.id) {
                    const isMySplit = splitList.includes(currentUser.id);
                    dailyBalance += (exp.amount - (isMySplit ? share : 0));
                } else if (splitList.includes(currentUser.id)) {
                    dailyBalance -= share;
                }
            });
            return dailyBalance;
        });
    }, [expenses, currentUser]);

    // Generate SVG path for a 7-day wave
    const { pathData, areaData, dayLabels } = React.useMemo(() => {
        const width = 300;
        const height = 100;
        const padding = 10;
        const xStep = width / 6;

        const maxAbs = Math.max(...history.map(Math.abs), 10);
        const yBase = height / 2;

        const points = history.map((val, i) => ({
            x: i * xStep,
            y: yBase - (val / maxAbs) * (height / 2 - padding)
        }));

        // Build a smooth cubic bezier path
        let d = `M ${points[0].x},${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const curr = points[i];
            const next = points[i + 1];
            const cp1x = curr.x + (next.x - curr.x) / 3;
            const cp2x = curr.x + (next.x - curr.x) * (2 / 3);
            d += ` C ${cp1x},${curr.y} ${cp2x},${next.y} ${next.x},${next.y}`;
        }

        const area = `${d} V ${height} H 0 Z`;

        const labels = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
        }

        return { pathData: d, areaData: area, dayLabels: labels };
    }, [history]);

    return (
        <div className="p-6 pb-32 space-y-8">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <motion.div
                        whileHover={{ rotate: 10 }}
                        className="w-12 h-12 rounded-full bg-[#abb4d9] flex items-center justify-center text-[#11111b] font-bold text-xl shadow-lg ring-4 ring-[#abb4d9]/20"
                    >
                        {currentUser?.email?.[0].toUpperCase() || 'L'}
                    </motion.div>
                    <div>
                        <h2 className="text-xl font-bold text-white leading-tight">Welcome back,</h2>
                        <p className="text-[10px] uppercase tracking-widest text-[#9399b2] font-black">YOUR DASHBOARD</p>
                    </div>
                </div>
                <button className="w-10 h-10 rounded-full bg-[#313244] flex items-center justify-center text-[#cdd6f4] hover:bg-[#45475a] transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#f38ba8] rounded-full ring-2 ring-[#313244]" />
                </button>
            </header>

            {/* Balance Card with Graph */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-[#262837] rounded-[32px] overflow-hidden shadow-2xl relative border border-white/5 h-64 flex flex-col justify-between"
            >
                <div className="p-6 pb-0 relative z-10 text-center">
                    <p className="text-[#a6adc8] text-[10px] font-black uppercase tracking-widest mb-1">Net Balance</p>
                    <div className="flex items-center justify-center gap-2">
                        <p className="text-4xl font-bold tracking-tight text-[#94e2d5]">
                            {balance >= 0 ? '+' : ''}₹{Math.abs(balance).toLocaleString('en-IN')}
                        </p>
                        <motion.div
                            initial={{ y: 5 }} animate={{ y: -5 }} transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94e2d5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12l5 5l10 -10" />
                            </svg>
                        </motion.div>
                    </div>
                </div>

                {/* Wave Graph */}
                <div className="relative w-full h-32 mt-4">
                    <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="gradientGraph" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#94e2d5" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#94e2d5" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <motion.path
                            initial={{ d: "M 0,50 L 300,50" }}
                            animate={{ d: areaData }}
                            transition={{ duration: 1, ease: "anticipate" }}
                            fill="url(#gradientGraph)"
                        />
                        <motion.path
                            initial={{ d: "M 0,50 L 300,50" }}
                            animate={{ d: pathData }}
                            transition={{ duration: 1, ease: "anticipate" }}
                            fill="none"
                            stroke="#94e2d5"
                            strokeWidth="3"
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>
                    {/* Zero Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5" />
                </div>

                {/* Days Label */}
                <div className="flex justify-between px-6 pb-6 text-[10px] text-[#585b70] font-bold uppercase">
                    {dayLabels.map(day => <span key={day}>{day}</span>)}
                </div>
            </motion.div>


            {/* Active Groups */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-white text-xs font-bold uppercase tracking-wider">Active Groups</h3>
                    <ChevronRight size={16} className="text-[#a6adc8] rotate-90" />
                </div>

                {groups.length > 0 ? (
                    <motion.div
                        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                        initial="hidden"
                        animate="show"
                        className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0"
                    >
                        {groups.map((group, i) => (
                            <motion.div
                                key={group.id}
                                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                            >
                                <div onClick={() => onSelectGroup(group)} className="bg-[#313244] p-4 rounded-3xl flex items-center gap-4 border border-white/5 active:bg-[#313244]/80 transition-colors cursor-pointer group hover:border-[#abb4d9]/50 relative overflow-hidden">
                                    {/* Icon Box */}
                                    <div className="w-12 h-12 bg-[#45475a]/50 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0 group-hover:scale-105 transition-transform z-10">
                                        {group.emoji}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 z-10 my-0.5">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-white text-base truncate leading-tight">{group.name}</h4>
                                            {group.budget > 0 && (
                                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-green-400/10 text-green-400 text-[8px] font-black uppercase tracking-wider border border-green-400/10">
                                                    Goal
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-sm font-black ${group.balance >= 0 ? 'text-[#a6e3a1]' : 'text-[#eba0ac]'} leading-tight my-0.5`}>
                                            {group.balance >= 0 ? '+' : ''}₹{Math.abs(group.balance).toLocaleString('en-IN')}
                                        </p>
                                        <p className="text-[10px] text-[#9399b2] font-black uppercase tracking-wider opacity-60">
                                            Admin: {group.owner?.full_name || 'Friend'}
                                        </p>
                                        <p className="text-[10px] text-[#a6adc8] font-medium truncate opacity-60">
                                            {group.members.slice(0, 3).map(m => m.name).join(', ')}
                                            {group.members.length > 3 ? ` +${group.members.length - 3}` : ''}
                                        </p>
                                    </div>

                                    {/* Avatar Stack & Status */}
                                    <div className="flex flex-col items-end gap-2 shrink-0 z-10">
                                        <div className="flex -space-x-2">
                                            {group.members.slice(0, 3).map((m, idx) => (
                                                <div key={idx} className="w-8 h-8 rounded-full border-2 border-[#313244] bg-[#45475a] flex items-center justify-center text-[10px] font-bold text-white shadow-sm overflow-hidden">
                                                    {m.avatar ? (
                                                        <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{(m.name || '?')[0]}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className={`w-2.5 h-2.5 rounded-full ${group.balance >= 0 ? 'bg-[#a6e3a1] shadow-[0_0_8px_rgba(166,227,161,0.5)]' : 'bg-[#eba0ac] shadow-[0_0_8px_rgba(235,160,172,0.5)]'}`} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="p-12 text-center bg-[#313244]/30 rounded-[40px] border border-dashed border-white/10">
                        <p className="text-[#a6adc8] font-bold text-lg mb-2">No groups found</p>
                        <p className="text-[#585b70] text-sm font-medium">Create a group to start tracking expenses.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomeView;
