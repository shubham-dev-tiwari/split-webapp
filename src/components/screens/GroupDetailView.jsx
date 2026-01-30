import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Utensils, Settings, Flame, Wine, MessageSquare, ReceiptText, Share2, Check, Plus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import SpotlightCard from '@/components/ui/SpotlightCard';
import GroupChat from '@/components/features/GroupChat';

const GroupDetailView = ({ group, onBack, onEdit, onEditExpense, onAdd }) => {
    const { expenses, settleUp, currentUser, shareSettlement, simplifyDebts, shareNudge } = useAppStore();
    const [activeTab, setActiveTab] = React.useState('expenses'); // 'expenses', 'settle', 'chat'

    // Filter expenses for this group
    const groupExpenses = expenses.filter(e => e.group_id === group.id);
    const totalSpent = groupExpenses.reduce((acc, curr) => acc + curr.amount, 0);

    const transfers = React.useMemo(() => simplifyDebts(group.id), [groupExpenses, group.id]);

    return (
        <div className="p-6 h-full flex flex-col space-y-6">
            <header className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-2xl bg-[#313244] text-[#abb4d9] border border-white/5 hover:bg-white/10 transition-colors">
                        <ChevronRight size={24} className="rotate-180" />
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{group.emoji}</span>
                        <h2 className="text-xl font-bold font-display tracking-tight text-white">{group.name}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => shareSettlement(group.id)}
                        className="p-3 bg-green-500/10 text-green-400 rounded-2xl hover:bg-green-500/20 transition-colors border border-green-500/10"
                    >
                        <Share2 size={20} />
                    </button>
                    <button onClick={onEdit} className="p-3 rounded-2xl bg-white/5 text-[#abb4d9] hover:bg-white/10 transition-colors border border-white/5">
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            {/* Tab Switcher */}
            <div className="flex p-1 bg-[#11111b] rounded-2xl border border-white/5 shrink-0">
                <button
                    onClick={() => setActiveTab('expenses')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${activeTab === 'expenses' ? 'bg-[#abb4d9] text-[#11111b] shadow-lg' : 'text-[#7f849c] hover:text-white'}`}
                >
                    <ReceiptText size={16} /> Ledger
                </button>
                <button
                    onClick={() => setActiveTab('settle')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${activeTab === 'settle' ? 'bg-[#abb4d9] text-[#11111b] shadow-lg' : 'text-[#7f849c] hover:text-white'}`}
                >
                    <Check size={16} /> Settlement
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${activeTab === 'chat' ? 'bg-[#abb4d9] text-[#11111b] shadow-lg' : 'text-[#7f849c] hover:text-white'}`}
                >
                    <MessageSquare size={16} /> Chat
                </button>
            </div>

            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {activeTab === 'expenses' && (
                        <motion.div
                            key="expenses"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="h-full overflow-y-auto no-scrollbar space-y-6 pb-20"
                        >
                            <div className="bg-[#262837] rounded-[40px] p-8 relative overflow-hidden shadow-2xl border border-white/5">
                                <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl pointer-events-none grayscale">{group.emoji}</div>
                                <p className="text-[#9399b2] text-[10px] font-black uppercase tracking-widest mb-1">Total Group Spending</p>
                                <p className="text-5xl font-black text-white tracking-tighter">₹{totalSpent.toLocaleString('en-IN')}</p>

                                {group.budget > 0 && (
                                    <div className="mt-6 space-y-2">
                                        <div className="flex justify-between items-end">
                                            <p className="text-[10px] font-black text-[#fab387] uppercase tracking-widest">Budget Goal</p>
                                            <p className="text-xs font-bold text-white">₹{totalSpent.toLocaleString()} / ₹{parseFloat(group.budget).toLocaleString()}</p>
                                        </div>
                                        <div className="h-2 w-full bg-[#181825] rounded-full overflow-hidden border border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min((totalSpent / group.budget) * 100, 100)}%` }}
                                                className={`h-full rounded-full ${totalSpent > group.budget ? 'bg-[#f38ba8]' : 'bg-[#a6e3a1]'}`}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <section>
                                <h3 className="text-[#a6adc8] text-[10px] font-black uppercase tracking-[0.2em] px-2 mb-4">Transactions</h3>
                                <div className="space-y-3">
                                    {groupExpenses.length > 0 ? (
                                        groupExpenses.map((expense) => (
                                            <motion.div
                                                key={expense.id}
                                                whileHover={{ x: 4 }}
                                                className="bg-[#313244]/40 p-4 rounded-3xl border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-[#313244]/60 active:scale-98 transition-all"
                                                onClick={() => {
                                                    // This will be handled by the parent to open the Edit modal
                                                    // console.log("Edit expense", expense);
                                                    onEditExpense(expense);
                                                }}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-[#181825] rounded-2xl flex items-center justify-center text-[#cba6f7] shadow-inner">
                                                        {expense.type === 'tobacco' ? <Flame size={20} className="text-[#fab387]" /> :
                                                            expense.type === 'beverages' || expense.type === 'party' ? <Wine size={20} className="text-[#cba6f7]" /> :
                                                                <Utensils size={20} className="text-[#a6e3a1]" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-sm truncate max-w-[150px]">{expense.description || 'Expense'}</p>
                                                        <p className="text-[10px] text-[#7f849c] font-black uppercase tracking-wider">
                                                            {new Date(expense.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {expense.payer_id === currentUser?.id ? 'You' : 'Member'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-white text-base">₹{expense.amount.toLocaleString('en-IN')}</p>
                                                    <p className="text-[8px] text-[#abb4d9] font-black uppercase tracking-widest">{expense.split_type || 'equal'}</p>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center bg-[#313244]/20 rounded-[40px] border border-dashed border-white/10">
                                            <p className="text-[#585b70] text-sm font-bold uppercase tracking-widest">No transactions yet.</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'settle' && (
                        <motion.div
                            key="settle"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="h-full overflow-y-auto no-scrollbar space-y-6 pb-20"
                        >
                            <div className="bg-[#abb4d9]/10 border border-[#abb4d9]/20 p-6 rounded-3xl">
                                <h3 className="text-[#abb4d9] text-[10px] font-black uppercase tracking-[0.2em] mb-4">Simplified Debts</h3>
                                {transfers.length > 0 ? (
                                    <div className="space-y-3">
                                        {transfers.map((t, i) => (
                                            <div key={i} className="bg-[#11111b]/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-[#a6adc8] mb-1">
                                                        <span className="text-white">{t.fromName === 'You' || t.from === currentUser?.id ? 'You' : t.fromName}</span>
                                                        <span className="mx-2 opacity-50">pays</span>
                                                        <span className="text-white">{t.toName === 'You' || t.to === currentUser?.id ? 'You' : t.toName}</span>
                                                    </p>
                                                    <p className="text-2xl font-black text-white">₹{Math.round(t.amount).toLocaleString('en-IN')}</p>
                                                </div>
                                                {(t.from === currentUser?.id || t.to === currentUser?.id) && (
                                                    <button
                                                        onClick={() => shareNudge(t)}
                                                        className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-500/30 transition-colors"
                                                    >
                                                        Nudge
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-[#a6e3a1] font-black text-lg mb-1">Accounts Clear! 🎉</p>
                                        <p className="text-[#585b70] text-xs font-bold font-black uppercase tracking-widest">Everyone is settled up.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-[#313244]/30 rounded-3xl border border-dashed border-white/10 text-center">
                                <p className="text-[#585b70] text-[10px] font-black uppercase tracking-widest mb-4">Master Settlement</p>
                                <button
                                    onClick={() => {
                                        if (confirm('Clear all ledger entries for this group? This cannot be undone.')) {
                                            settleUp(group.id);
                                        }
                                    }}
                                    className="w-full py-4 bg-[#f38ba8]/10 text-[#f38ba8] rounded-2xl font-bold text-sm border border-[#f38ba8]/20 hover:bg-[#f38ba8]/20 transition-all"
                                >
                                    Clear Accounts Forever
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'chat' && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full"
                        >
                            <GroupChat groupId={group.id} currentUser={currentUser} />
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Floating Add Button - Only for Ledger tab */}
                {activeTab === 'expenses' && (
                    <motion.div
                        initial={{ scale: 0, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0, y: 20 }}
                        className="absolute bottom-6 right-6 z-50 md:hidden"
                    >
                        <button
                            onClick={onAdd}
                            className="w-16 h-16 bg-[#abb4d9] text-[#11111b] rounded-full shadow-2xl shadow-[#abb4d9]/40 flex items-center justify-center active:scale-95 transition-transform"
                        >
                            <Plus size={32} strokeWidth={3} />
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default GroupDetailView;
