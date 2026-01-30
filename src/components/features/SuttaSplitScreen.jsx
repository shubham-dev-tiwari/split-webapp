import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cigarette, X, Check, Flame } from 'lucide-react';

const PRESET_ITEMS = [
    { id: 'standard', name: 'Small Pack', price: 10 },
    { id: 'premium', name: 'Large Pack', price: 20 },
    { id: 'medium', name: 'Regular Pack', price: 18 },
];

const TobaccoLedgerScreen = ({ onClose, onComplete, members }) => {
    const [amount, setAmount] = useState('10');
    const [selectedMembers, setSelectedMembers] = useState(members);
    const [selectedItems, setSelectedItems] = useState(['standard']); // Default one selected

    const toggleMember = (member) => {
        if (selectedMembers.find(m => m.id === member.id)) {
            setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
        } else {
            setSelectedMembers([...selectedMembers, member]);
        }
    };

    const toggleItem = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(s => s !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const splitAmount = (parseFloat(amount) || 0) / (selectedMembers.length || 1);

    return (
        <div className="h-full overflow-y-auto no-scrollbar bg-[#11111b] flex flex-col">
            {/* Header (Scrolls with page) */}
            <div className="bg-[#11111b] px-6 pt-6 pb-4 border-b border-[#313244]/50 shrink-0">
                <header className="flex items-center justify-between">
                    <div className="text-[#94e2d5] flex size-10 shrink-0 items-center justify-center bg-[#94e2d5]/10 rounded-full">
                        <Flame size={20} />
                    </div>
                    <h2 className="text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center font-display">Tobacco Ledger</h2>
                    <button onClick={onClose} className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-[#313244] text-white hover:bg-[#313244]/80 transition-colors">
                        <X size={20} />
                    </button>
                </header>

                {/* Frequently Split With (In Header) */}
                <div className="mt-6 flex flex-col gap-3">
                    <div className="px-1 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#a6adc8]/60">Frequently Split With</span>
                    </div>
                    <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar px-1">
                        {members.map((m, i) => {
                            const isSelected = selectedMembers.find(sm => sm.id === m.id);
                            return (
                                <div key={m.id || i} className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer" onClick={() => toggleMember(m)}>
                                    <div className="relative size-14 transition-transform group-active:scale-95">
                                        <div className={`absolute inset-0 rounded-full border-2 transition-colors ${isSelected ? 'border-[#cba6f7] ring-2 ring-[#94e2d5]/40 ring-offset-2 ring-offset-[#11111b]' : 'border-transparent'}`}></div>
                                        <div className={`w-full h-full rounded-full bg-gradient-to-br ${['from-pink-500 to-rose-500', 'from-blue-500 to-cyan-500', 'from-emerald-500 to-teal-500', 'from-violet-500 to-purple-500', 'from-amber-500 to-orange-500'][i % 5]} flex items-center justify-center overflow-hidden`}>
                                            <span className="font-bold text-sm text-white shadow-sm">{m.name?.[0] || '?'}</span>
                                        </div>
                                        {isSelected && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-[#94e2d5]/40 backdrop-blur-[1px] rounded-full">
                                                <Check size={20} className="text-[#94e2d5] stroke-[3px] drop-shadow-md" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[#a6adc8] text-[10px] font-medium">{m.name?.split(' ')[0] || 'Unknown'}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 px-6 py-6 space-y-6 w-full max-w-3xl mx-auto">
                {/* Item Selection */}
                <div className="space-y-3">
                    <h3 className="text-white text-base font-bold tracking-tight px-1">Select Item</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {PRESET_ITEMS.map((item) => {
                            const isSelected = selectedItems.includes(item.id);
                            return (
                                <motion.div
                                    key={item.id}
                                    onClick={() => toggleItem(item.id)}
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'bg-[#94e2d5]/10 border-[#94e2d5]' : 'bg-[#313244]/30 border-white/5'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-[#94e2d5] border-[#94e2d5]' : 'border-[#6c7086] bg-transparent'}`}>
                                            {isSelected && <Check size={14} className="text-[#11111b] stroke-[3px]" />}
                                        </div>
                                        <span className={`font-bold ${isSelected ? 'text-white' : 'text-[#a6adc8]'}`}>{item.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-[#6c7086] bg-[#11111b]/50 px-2 py-1 rounded-md">₹{item.price}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Member Selection */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-white text-base font-bold tracking-tight">Select Members</h3>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#94e2d5] bg-[#94e2d5]/10 px-2 py-1 rounded-md">{selectedMembers.length} Selected</span>
                    </div>

                    <motion.div
                        initial="hidden" animate="show"
                        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                        className="flex flex-col gap-3"
                    >
                        {members.map((member, i) => {
                            const isSelected = selectedMembers.find(sm => sm.id === member.id);
                            return (
                                <motion.div
                                    key={member.id || i}
                                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                                    onClick={() => toggleMember(member)}
                                    className={`flex items-center gap-4 px-4 py-3 min-h-[64px] justify-between rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? 'bg-[#313244] border-[#94e2d5]/40 shadow-lg shadow-black/20' : 'bg-[#313244]/20 border-transparent opacity-60'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`size-10 rounded-full flex items-center justify-center font-bold text-white uppercase ring-2 shadow-inner ${isSelected ? 'ring-[#94e2d5]/40 bg-gradient-to-br from-[#94e2d5] to-[#45475a]' : 'ring-[#b4befe]/20 bg-[#45475a]'}`}>
                                            {member.name?.[0] || '?'}
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <p className="text-white text-sm font-semibold leading-normal">{member.name}</p>
                                            <p className={`${isSelected ? 'text-[#94e2d5]' : 'text-[#a6adc8]'} text-[13px] font-medium leading-normal`}>
                                                ₹{isSelected ? splitAmount.toFixed(0) : '0'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        <div className={`relative flex h-[28px] w-[48px] items-center rounded-full p-1 transition-colors ${isSelected ? 'bg-[#94e2d5] justify-end' : 'bg-[#313244] border border-[#6c7086]/30 justify-start'}`}>
                                            <motion.div layout className={`h-5 w-5 rounded-full shadow-sm ${isSelected ? 'bg-white' : 'bg-[#a6adc8]/50'}`} />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-[#11111b] border-t border-[#313244]/50 pb-8 md:rounded-b-[32px] shrink-0">
                <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[#a6adc8] text-[10px] font-bold uppercase tracking-widest">Total Expense</span>
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <span className="text-[#89dceb] text-2xl font-bold">₹</span>
                            </div>
                            <input
                                className="w-full bg-[#89dceb]/10 border-2 border-[#89dceb] text-[#89dceb] text-3xl font-bold text-center py-3 rounded-2xl focus:ring-4 focus:ring-[#89dceb]/20 focus:outline-none transition-all placeholder:text-[#89dceb]/40"
                                placeholder="0"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => onComplete({
                            amount: parseFloat(amount),
                            desc: `Consumables (${selectedItems.map(id => PRESET_ITEMS.find(p => p.id === id)?.name).join(', ')})`,
                            type: 'tobacco',
                            splitList: selectedMembers.map(m => m.id)
                        })}
                        className="w-full bg-[#94e2d5] hover:bg-[#89dceb] text-[#11111b] h-14 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-[#94e2d5]/20"
                    >
                        <span className="text-lg font-bold">Confirm Split</span>
                        <Check className="font-bold" strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TobaccoLedgerScreen;
