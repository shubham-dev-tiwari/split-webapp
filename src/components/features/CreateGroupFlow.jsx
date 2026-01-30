import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronRight, Search, UserCheck } from 'lucide-react';
import SheetHeader from '@/components/ui/SheetHeader';
import { supabase } from '@/lib/supabase';

const EMOJIS = ['🏖️', '🏠', '🍻', '🎓', '🍱', '🚕', '🎮', '💡', '⚽', '🍕', '💃', '🚀'];

const CreateGroupFlow = ({ onClose, onComplete }) => {
    const [name, setName] = useState('');
    const [emoji, setEmoji] = useState(EMOJIS[0]);
    const [budget, setBudget] = useState('');
    const [members, setMembers] = useState([]); // Array of objects { id, name, is_real }
    const [newMember, setNewMember] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const searchUsers = async (query) => {
        if (!query.trim() || query.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .or(`full_name.ilike.%${query}%,id.eq.${query}`)
            .limit(5);

        if (!error && data) {
            setSearchResults(data);
        }
        setIsSearching(false);
    };

    const handleAddMember = (userProfile = null) => {
        if (userProfile) {
            if (members.some(m => m.id === userProfile.id)) return;
            setMembers([...members, {
                id: userProfile.id,
                name: userProfile.full_name,
                avatar: userProfile.avatar_url,
                is_real: true
            }]);
            setNewMember('');
            setSearchResults([]);
        } else if (newMember.trim()) {
            if (members.some(m => m.name === newMember.trim())) return;
            setMembers([...members, {
                id: `guest-${Date.now()}`,
                name: newMember.trim(),
                is_real: false
            }]);
            setNewMember('');
            setSearchResults([]);
        }
    };

    const handleComplete = () => {
        if (name.trim()) {
            onComplete({
                name: name.trim(),
                emoji,
                budget: parseFloat(budget) || 0,
                members
            });
        }
    };

    return (
        <div className="flex flex-col h-full p-6 space-y-6 max-w-3xl mx-auto w-full">
            <SheetHeader title="Create Group" onClose={onClose} />

            <div className="space-y-8 flex-1 overflow-y-auto no-scrollbar pb-32">
                {/* Name & Budget Row */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-[#9399b2] uppercase tracking-[0.2em] px-1 blur-[0.4px]">Group Name</label>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="e.g. Goa Trip, Flat Rent"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[24px] text-white font-bold outline-none focus:border-lavender/50 focus:bg-white/10 transition-all shadow-2xl"
                            />
                            <div className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-lavender/20 to-mauve/20 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none blur-xl" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-[#9399b2] uppercase tracking-[0.2em] px-1">Group Budget (Limit) 💰</label>
                        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-[24px] focus-within:border-green-400/50 transition-all">
                            <span className="text-green-400 font-black text-xl ml-2">₹</span>
                            <input
                                type="number"
                                placeholder="Set budget (Optional)"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-white font-bold text-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Emoji Selection */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-[#9399b2] uppercase tracking-[0.2em] px-1">Select Theme</label>
                    <div className="grid grid-cols-6 gap-3">
                        {EMOJIS.map(e => (
                            <motion.button
                                key={e}
                                whileHover={{ scale: 1.1, y: -4 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setEmoji(e)}
                                className={`text-2xl p-4 rounded-[20px] transition-all flex items-center justify-center ${emoji === e ? 'bg-lavender text-crust shadow-[0_0_20px_rgba(180,190,254,0.4)]' : 'bg-white/5 hover:bg-white/10 border border-white/5'}`}
                            >
                                {e}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Members */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-[#9399b2] uppercase tracking-[0.2em] px-1">Member Management</label>
                    <div className="relative">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#585b70]" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search real users or enter name..."
                                    value={newMember}
                                    onChange={(e) => {
                                        setNewMember(e.target.value);
                                        searchUsers(e.target.value);
                                    }}
                                    className="w-full bg-white/5 border border-white/10 p-5 pl-12 rounded-[24px] text-white font-bold outline-none focus:border-lavender/30 transition-all"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAddMember()}
                                className="p-5 bg-white/10 text-white rounded-[24px] font-black border border-white/10"
                            >
                                <Plus size={24} strokeWidth={3} />
                            </motion.button>
                        </div>

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {(searchResults.length > 0 || isSearching) && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute left-0 right-0 top-full mt-2 bg-[#1e1e2e] border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden"
                                >
                                    {isSearching ? (
                                        <div className="p-4 text-center text-[10px] font-black uppercase text-[#585b70] tracking-[0.2em]">Searching Lekha Jokha...</div>
                                    ) : (
                                        searchResults.map(user => (
                                            <button
                                                key={user.id}
                                                onClick={() => handleAddMember(user)}
                                                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-lavender/10 flex items-center justify-center text-lavender font-black text-xs border border-lavender/20">
                                                        {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" /> : user.full_name[0]}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-sm text-white">{user.full_name}</p>
                                                        <p className="text-[10px] text-[#585b70] font-black uppercase">Registered User</p>
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 opacity-0 group-hover:opacity-100 transition-opacity border border-green-500/20">
                                                    <Plus size={16} strokeWidth={3} />
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                        <AnimatePresence>
                            {members.map((m, idx) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, scale: 0.8, x: -10 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className={`pl-4 pr-3 py-2 rounded-full flex items-center gap-2 border border-white/10 backdrop-blur-md shadow-lg ${m.is_real ? 'bg-lavender/20 text-lavender' : 'bg-white/10 text-white'}`}
                                >
                                    {m.is_real && <UserCheck size={12} className="text-green-400" />}
                                    <span className="font-bold text-xs tracking-tight">{m.name}</span>
                                    <button onClick={() => setMembers(members.filter(mem => mem.id !== m.id))} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                                        <X size={12} strokeWidth={3} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="pt-4 pb-8">
                <motion.button
                    whileHover={name.trim() ? { scale: 1.02, y: -2 } : {}}
                    whileTap={name.trim() ? { scale: 0.98 } : {}}
                    disabled={!name.trim()}
                    onClick={handleComplete}
                    className={`w-full py-5 rounded-[28px] font-black text-xl shadow-2xl transition-all ${name.trim() ? 'bg-gradient-to-r from-lavender to-mauve text-crust shadow-lavender/20' : 'bg-surface0 text-overlay0 cursor-not-allowed border border-white/5 opacity-50'}`}
                >
                    Create Group 🚀
                </motion.button>
            </div>
        </div>
    );
};

export default CreateGroupFlow;
