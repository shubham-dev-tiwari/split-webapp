import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Beer, Cigarette, Utensils, Check, ChevronRight, Plus } from 'lucide-react';
import SheetHeader from '@/components/ui/SheetHeader';
import TobaccoLedgerScreen from '@/components/features/SuttaSplitScreen';
import { useAppStore } from '@/store/useAppStore';
import { PRESETS } from '@/lib/constants';

const AddExpenseFlow = ({ onClose, onComplete, members, initialExpense }) => {
    const [step, setStep] = useState(initialExpense ? 'details' : 'type');
    const [type, setType] = useState(initialExpense?.type || null);
    const [amount, setAmount] = useState(initialExpense?.amount || '');
    const [description, setDescription] = useState(initialExpense?.description || '');
    const [date, setDate] = useState(initialExpense ? new Date(initialExpense.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [splitType, setSplitType] = useState(initialExpense?.split_type || 'equal'); // 'equal', 'percentage', 'portion'
    const [splitData, setSplitData] = useState(initialExpense?.split_data || {}); // { memberId: value }
    const [involvedMembers, setInvolvedMembers] = useState(initialExpense?.split_list || members.map(m => m.id));
    const [payerId, setPayerId] = useState(initialExpense?.payer_id || null);
    const [tags, setTags] = useState(initialExpense?.type || 'custom');
    const { currentUser } = useAppStore();

    // Default payer to current user if not set
    React.useEffect(() => {
        if (!payerId && currentUser) setPayerId(currentUser.id);
    }, [currentUser]);

    // Initialize split data when entering split step
    const initSplitData = (type) => {
        const data = {};
        if (type === 'percentage') {
            const equal = Math.floor(100 / members.length);
            members.forEach(m => data[m.id] = equal);
        } else if (type === 'portion') {
            members.forEach(m => data[m.id] = 1);
        }
        setSplitData(data);
        setSplitType(type);
    };

    const updateSplitValue = (mId, val) => {
        setSplitData(prev => ({ ...prev, [mId]: parseFloat(val) || 0 }));
    };

    const isSplitValid = useMemo(() => {
        if (involvedMembers.length === 0) return false;
        if (splitType === 'equal') return true;
        if (splitType === 'percentage') {
            const sum = involvedMembers.reduce((acc, mId) => acc + (splitData[mId] || 0), 0);
            return Math.abs(sum - 100) < 0.1;
        }
        if (splitType === 'portion') {
            const sum = involvedMembers.reduce((acc, mId) => acc + (splitData[mId] || 0), 0);
            return sum > 0;
        }
        return false;
    }, [splitType, splitData, involvedMembers]);

    // Party specific state (kept for backward compatibility/preset flow)
    const [partyItems, setPartyItems] = useState([
        { id: 1, name: 'Beverages', icon: <Beer size={18} />, amount: '', selected: members },
        { id: 2, name: 'Tobacco', icon: <Cigarette size={18} />, amount: '', selected: members },
        { id: 3, name: 'Chakhna', icon: <Utensils size={18} />, amount: '', selected: members },
    ]);

    const totalPartyAmount = useMemo(() => {
        return partyItems.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    }, [partyItems]);

    if (step === 'type') {
        return (
            <div className="flex flex-col h-full p-6 space-y-4 max-w-3xl mx-auto w-full">
                <SheetHeader title="Record Expense" onClose={onClose} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto no-scrollbar pb-20">
                    {PRESETS.map((p, i) => (
                        <motion.button
                            key={p.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setType(p.id);
                                if (p.id === 'tobacco') {
                                    setStep('tobacco-split');
                                } else {
                                    setStep(p.id === 'beverages' ? 'party-details' : 'details');
                                }
                            }}
                            className={`relative overflow-hidden w-full p-4 rounded-3xl border ${p.border} bg-gradient-to-r ${p.gradient} flex items-center gap-4 group text-left shrink-0`}
                        >
                            <div className={`p-4 rounded-2xl ${p.bg} ${p.color} ring-1 ring-inset ring-white/5`}>
                                {p.icon}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-lg text-white group-hover:text-[#abb4d9] transition-colors">{p.name}</p>
                                <p className="text-xs text-[#a6adc8] font-medium">{p.desc}</p>
                            </div>
                        </motion.button>
                    ))}

                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        onClick={() => { setType('custom'); setStep('details'); }}
                        className="w-full p-4 rounded-3xl border border-white/5 bg-[#313244]/30 hover:bg-[#313244]/50 flex items-center gap-4 text-left group transition-all shrink-0"
                    >
                        <div className="p-4 rounded-2xl bg-white/5 text-[#a6adc8]">
                            <Plus size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-lg text-[#a6adc8] group-hover:text-white transition-colors">Other</p>
                            <p className="text-xs text-[#6c7086]">Enter custom transaction</p>
                        </div>
                    </motion.button>
                </div>
            </div>
        );
    }

    if (step === 'tobacco-split') {
        return <TobaccoLedgerScreen onClose={onClose} onComplete={onComplete} members={members} />;
    }

    if (step === 'party-details') {
        const total = partyItems.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
        return (
            <div className="flex flex-col h-full p-6 space-y-6 max-w-3xl mx-auto w-full">
                <SheetHeader title="Party Details" onClose={onClose} />
                <div className="bg-[#11111b] p-6 rounded-3xl text-center border border-white/5 shadow-inner">
                    <p className="text-[#a6adc8] text-[10px] font-black uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-4xl font-black text-[#74c7ec] font-display tracking-tight">₹{total.toLocaleString('en-IN')}</p>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pb-32">
                    {partyItems.map(item => (
                        <div key={item.id} className="bg-[#313244]/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#45475a]/50 rounded-xl flex items-center justify-center text-[#cba6f7]">
                                    {item.icon}
                                </div>
                                <p className="font-bold text-white">{item.name}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-[#181825] px-3 py-2 rounded-xl border border-white/5">
                                <span className="text-[#7f849c] font-bold text-sm">₹</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={item.amount}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setPartyItems(items => items.map(i => i.id === item.id ? { ...i, amount: val } : i));
                                    }}
                                    className="bg-transparent border-none outline-none text-right font-bold w-16 text-white text-sm"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    disabled={total <= 0}
                    onClick={() => {
                        setAmount(total);
                        setDescription(partyItems.filter(i => (parseFloat(i.amount) || 0) > 0).map(i => i.name).join(', '));
                        setStep('split-config');
                    }}
                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg ${total > 0 ? 'bg-[#abb4d9] text-[#11111b]' : 'bg-[#313244] text-[#585b70]'}`}
                >
                    Split Config
                </motion.button>
            </div>
        );
    }

    if (step === 'details') {
        return (
            <div className="flex flex-col h-full p-6 space-y-6 max-w-3xl mx-auto w-full">
                <SheetHeader title="Basic Details" onClose={onClose} />
                <div className="space-y-4">
                    <div className="bg-[#11111b] p-6 rounded-[32px] border border-white/5">
                        <p className="text-[#a6adc8] text-[10px] font-black uppercase tracking-widest mb-4">How much?</p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-3xl font-black text-[#abb4d9]">₹</span>
                            <input
                                type="number"
                                autoFocus
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="bg-transparent border-none outline-none text-4xl font-black text-white w-40 text-center"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[#a6adc8] text-[10px] font-black uppercase tracking-widest px-2">Description & Date</p>
                        <input
                            type="text"
                            placeholder="What was this for?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#313244]/50 border border-white/5 rounded-2xl px-4 py-4 text-white font-bold outline-none focus:border-[#abb4d9]/30"
                        />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-[#313244]/50 border border-white/5 rounded-2xl px-4 py-4 text-white font-bold outline-none focus:border-[#abb4d9]/30"
                        />
                    </div>
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    disabled={!amount || parseFloat(amount) <= 0}
                    onClick={() => setStep('split-config')}
                    className={`w-full py-4 rounded-2xl font-bold text-lg ${amount > 0 ? 'bg-[#abb4d9] text-[#11111b]' : 'bg-[#313244] text-[#585b70]'}`}
                >
                    Continue to Split
                </motion.button>
            </div>
        );
    }

    if (step === 'split-config') {
        return (
            <div className="flex flex-col h-full p-6 space-y-6 max-w-3xl mx-auto w-full">
                <SheetHeader title="Configure Split" onClose={onClose} />
                <div className="flex bg-[#11111b] p-1.5 rounded-2xl border border-white/5 overflow-hidden">
                    {['equal', 'percentage', 'portion'].map(t => (
                        <button
                            key={t}
                            onClick={() => initSplitData(t)}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${splitType === t ? 'bg-[#abb4d9] text-[#11111b]' : 'text-[#a6adc8] hover:bg-white/5'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-32">
                    <div className="space-y-2">
                        <p className="text-[#a6adc8] text-[10px] font-black uppercase tracking-widest px-2">Who Paid?</p>
                        <div className="flex flex-wrap gap-2">
                            {members.map(m => (
                                <button
                                    key={`payer-${m.id}`}
                                    onClick={() => setPayerId(m.id)}
                                    className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${payerId === m.id ? 'bg-[#a6e3a1] text-[#11111b] border-[#a6e3a1]' : 'bg-[#313244]/50 text-[#a6adc8] border-white/5 hover:bg-[#313244]'}`}
                                >
                                    {m.name === 'You' || m.id === currentUser?.id ? 'You' : m.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-2">
                            <p className="text-[#a6adc8] text-[10px] font-black uppercase tracking-widest">Select Involved Members</p>
                            <button
                                onClick={() => setInvolvedMembers(involvedMembers.length === members.length ? [] : members.map(m => m.id))}
                                className="text-[9px] font-black text-[#74c7ec] uppercase hover:underline"
                            >
                                {involvedMembers.length === members.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        {members.map(member => (
                            <div
                                key={member.id}
                                onClick={() => {
                                    if (involvedMembers.includes(member.id)) {
                                        setInvolvedMembers(prev => prev.filter(id => id !== member.id));
                                    } else {
                                        setInvolvedMembers(prev => [...prev, member.id]);
                                    }
                                }}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${involvedMembers.includes(member.id) ? 'bg-[#313244] border-[#abb4d9]/30' : 'bg-[#181825]/30 border-white/5 opacity-50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#45475a]/50 flex items-center justify-center font-bold text-[10px] uppercase text-white">
                                        {(member.name || '?')[0]}
                                    </div>
                                    <p className="font-bold text-sm text-white">{member.name}</p>
                                </div>
                                {involvedMembers.includes(member.id) && (
                                    <div className="w-5 h-5 bg-[#a6e3a1] rounded-full flex items-center justify-center">
                                        <Check size={12} className="text-[#11111b]" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {involvedMembers.length > 0 && splitType !== 'equal' && (
                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <p className="text-[#a6adc8] text-[10px] font-black uppercase tracking-widest px-2">Fine-tune Split</p>
                            {members.filter(m => involvedMembers.includes(m.id)).map(member => (
                                <div key={`split-${member.id}`} className="bg-[#313244]/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                                    <p className="font-bold text-xs text-white">{member.name}</p>
                                    <div className="flex items-center gap-2 bg-[#181825] px-3 py-2 rounded-xl border border-white/5 w-24">
                                        <input
                                            type="number"
                                            value={splitData[member.id] || 0}
                                            onChange={(e) => updateSplitValue(member.id, e.target.value)}
                                            className="bg-transparent border-none outline-none text-right font-bold w-full text-white text-sm"
                                        />
                                        <span className="text-[#585b70] font-bold text-sm">{splitType === 'percentage' ? '%' : ''}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pt-4 space-y-3">
                    {splitType === 'percentage' && !isSplitValid && (
                        <p className="text-center text-[#f38ba8] text-[10px] font-bold uppercase">Total must sum to 100% (Current: {Object.values(splitData).reduce((a, b) => a + b, 0)}%)</p>
                    )}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        disabled={!isSplitValid}
                        onClick={() => setStep('review')}
                        className={`w-full py-4 rounded-2xl font-bold text-lg ${isSplitValid ? 'bg-gradient-to-r from-[#abb4d9] to-[#cba6f7] text-[#11111b]' : 'bg-[#313244] text-[#585b70]'}`}
                    >
                        Review Transaction
                    </motion.button>
                </div>
            </div>
        );
    }

    if (step === 'review') {
        return (
            <div className="flex flex-col h-full p-6 space-y-6 max-w-3xl mx-auto w-full">
                <SheetHeader title="Final Review" onClose={onClose} />
                <div className="bg-[#11111b] p-6 rounded-3xl border border-white/5">
                    <p className="text-[#a6adc8] text-[10px] font-black uppercase tracking-widest mb-1">{description || 'Expense'}</p>
                    <p className="text-4xl font-black text-white leading-none mb-2">₹{parseFloat(amount).toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-[#585b70] font-bold uppercase tracking-widest">{new Date(date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                    {members.map(member => {
                        if (!involvedMembers.includes(member.id)) return null;

                        let share = 0;
                        const amt = parseFloat(amount);
                        if (splitType === 'equal') share = amt / involvedMembers.length;
                        else if (splitType === 'percentage') share = (amt * (splitData[member.id] || 0)) / 100;
                        else if (splitType === 'portion') {
                            const total = involvedMembers.reduce((acc, mId) => acc + (splitData[mId] || 0), 0) || 1;
                            share = (amt * (splitData[member.id] || 0)) / total;
                        }

                        const isPayer = member.id === payerId;
                        return (
                            <div key={member.id} className="p-4 bg-[#313244]/50 rounded-2xl border border-white/5 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <p className="font-bold text-sm text-[#a6adc8]">{member.name}</p>
                                    {isPayer && <span className="text-[8px] font-black text-[#a6e3a1] uppercase">The Payer</span>}
                                </div>
                                <p className={`font-black ${isPayer ? 'text-[#a6e3a1]' : 'text-white'}`}>
                                    {isPayer ? `Rec: ₹${(amt - share).toFixed(0)}` : `Owes: ₹${share.toFixed(0)}`}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onComplete({
                        amount,
                        desc: description || 'Miscellaneous',
                        type: tags || 'custom',
                        date,
                        splitType,
                        splitData,
                        splitList: involvedMembers,
                        payerId: payerId
                    })}
                    className="w-full bg-[#abb4d9] text-[#11111b] py-4 rounded-2xl font-bold text-lg shadow-xl"
                >
                    {initialExpense ? 'Update Transaction' : 'Confirm & Record'}
                </motion.button>
            </div>
        );
    }

    return null;
};

export default AddExpenseFlow;
