import { useAppStore } from '@/store/useAppStore';
import { History, Utensils, Flame, Trash2, Wine } from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';

const HistoryView = () => {
    const { expenses, deleteExpense } = useAppStore();

    if (expenses.length === 0) {
        return (
            <div className="p-6 text-center py-20 flex flex-col items-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <History size={32} className="text-[#45475a]" />
                </div>
                <p className="text-[#a6adc8] font-medium text-lg">No transactions recorded yet</p>
                <p className="text-[#585b70] text-sm mt-2">Start tracking expenses with your group!</p>
            </div>
        );
    }

    return (
        <div className="p-6 pb-32 space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white leading-tight">History</h2>
                    <p className="text-[10px] uppercase tracking-widest text-[#9399b2] font-black">TRANSACTION HISTORY</p>
                </div>
                <div className="p-2 rounded-full bg-[#313244] text-[#cdd6f4]">
                    <History size={20} />
                </div>
            </header>

            <div className="space-y-4">
                {expenses.slice().reverse().map((expense) => (
                    <SpotlightCard key={expense.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#181825] rounded-xl flex items-center justify-center text-[#cba6f7] shadow-inner">
                                {expense.type === 'tobacco' ? <Flame size={20} className="text-[#fab387]" /> :
                                    expense.type === 'beverages' ? <Wine size={20} className="text-[#cba6f7]" /> :
                                        <Utensils size={20} className="text-[#a6e3a1]" />}
                            </div>
                            <div>
                                <p className="font-bold text-white">{expense.desc}</p>
                                <p className="text-[10px] text-[#7f849c] font-medium">
                                    {expense.groupName} • Paid by {expense.payer}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="font-bold text-white text-lg">₹{expense.amount.toLocaleString('en-IN')}</p>
                                <p className="text-[10px] text-[#585b70]">
                                    {new Date(expense.date).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                </p>
                            </div>
                            <button
                                onClick={() => deleteExpense(expense.id)}
                                className="p-2 text-[#f38ba8] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5 rounded-lg"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </SpotlightCard>
                ))}
            </div>
        </div>
    );
};

export default HistoryView;
