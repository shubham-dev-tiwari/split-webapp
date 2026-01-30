import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, Search, UserCheck } from 'lucide-react';
import SheetHeader from '@/components/ui/SheetHeader';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';

const EMOJIS = ['🏖️', '🏠', '🍻', '🎓', '🍱', '🚕', '🎮', '💡', '⚽', '🍕', '💃', '🚀'];

const EditGroupFlow = ({ group, onClose, onUpdate, onDelete }) => {
    const [name, setName] = useState(group.name);
    const [emoji, setEmoji] = useState(group.emoji);
    const [members, setMembers] = useState(group.members || []);
    const [newMember, setNewMember] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const { currentUser, addNotification } = useAppStore();

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
            if (members.some(m => m.id === userProfile.id)) {
                addNotification("User already in group", "info");
                return;
            }
            setMembers([...members, {
                id: userProfile.id,
                name: userProfile.full_name,
                avatar: userProfile.avatar_url,
                is_real: true,
                is_new: true
            }]);
            setNewMember('');
            setSearchResults([]);
        } else if (newMember.trim()) {
            if (members.some(m => m.name === newMember.trim())) {
                addNotification("Member already exists", "info");
                return;
            }
            const guestMember = {
                id: `guest-${Date.now()}`,
                name: newMember.trim(),
                is_real: false,
                is_new: true
            };
            setMembers([...members, guestMember]);
            setNewMember('');
            setSearchResults([]);
        }
    };

    const handleUpdate = () => {
        if (name.trim()) {
            onUpdate(group.id, {
                name: name.trim(),
                emoji,
                members // The store will handle diffing this
            });
        }
    };

    return (
        <div className="flex flex-col h-full p-6 space-y-6 max-w-3xl mx-auto w-full">
            <SheetHeader title="Edit Group" onClose={onClose} />

            <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pb-32">
                {/* Name Input */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#9399b2] uppercase tracking-widest px-1">Group Name</label>
                    <input
                        type="text"
                        placeholder="e.g. Goa Trip, Flat Rent"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#313244]/50 border border-white/5 p-4 rounded-2xl text-white font-bold outline-none focus:border-[#abb4d9]/50 transition-colors"
                    />
                </div>

                {/* Emoji Selection */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#9399b2] uppercase tracking-widest px-1">Select Theme</label>
                    <div className="grid grid-cols-6 gap-2">
                        {EMOJIS.map(e => (
                            <button
                                key={e}
                                onClick={() => setEmoji(e)}
                                className={`text-2xl p-4 rounded-2xl transition-all ${emoji === e ? 'bg-[#abb4d9] scale-110 shadow-lg' : 'bg-[#313244]/30 hover:bg-[#313244]/50'}`}
                            >
                                {e}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Members */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#9399b2] uppercase tracking-widest px-1">Member Management</label>
                    <div className="relative">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#585b70]" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search users or add name..."
                                    value={newMember}
                                    onChange={(e) => {
                                        setNewMember(e.target.value);
                                        searchUsers(e.target.value);
                                    }}
                                    className="w-full bg-[#313244]/50 border border-white/5 p-4 pl-12 rounded-2xl text-white font-bold outline-none"
                                />
                            </div>
                            <button
                                onClick={() => handleAddMember()}
                                className="p-4 bg-[#abb4d9] text-[#11111b] rounded-2xl font-bold"
                            >
                                <Plus size={24} />
                            </button>
                        </div>

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {(searchResults.length > 0 || isSearching) && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute left-0 right-0 top-full mt-2 bg-[#1e1e2e] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                >
                                    {isSearching ? (
                                        <div className="p-4 text-center text-[10px] font-black uppercase text-[#585b70]">Searching...</div>
                                    ) : (
                                        searchResults.map(user => (
                                            <button
                                                key={user.id}
                                                onClick={() => handleAddMember(user)}
                                                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors group border-b border-white/5 last:border-0"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-lavender/10 flex items-center justify-center text-lavender font-black text-[10px] border border-lavender/20">
                                                        {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" /> : user.full_name[0]}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-sm text-white">{user.full_name}</p>
                                                        <p className="text-[9px] text-[#585b70] font-black uppercase">Registered Profile</p>
                                                    </div>
                                                </div>
                                                <Plus size={16} className="text-lavender opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                        {members.map(m => (
                            <div key={m.id} className={`px-4 py-2 rounded-xl flex items-center gap-2 border border-white/5 ${m.is_real ? 'bg-[#abb4d9]/20 text-[#abb4d9]' : 'bg-[#45475a] text-white'}`}>
                                {m.is_real && <UserCheck size={12} className="text-[#a6e3a1]" />}
                                <span className="font-bold text-sm">{m.name}</span>
                                {m.id !== currentUser?.id && (
                                    <button onClick={() => setMembers(members.filter(mem => mem.id !== m.id))}>
                                        <X size={14} className="text-[#f38ba8]" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-[9px] text-[#585b70] font-bold uppercase px-1">Note: Removing members here won't delete their transaction history.</p>
                </div>

                {/* Delete Group Button */}
                <div className="pt-6">
                    <button
                        onClick={() => onDelete(group.id)}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-[#f38ba8]/10 text-[#f38ba8] rounded-2xl font-bold border border-[#f38ba8]/20 hover:bg-[#f38ba8]/20 transition-colors"
                    >
                        <Trash2 size={20} />
                        Delete Group
                    </button>
                </div>
            </div>

            <div className="pt-4">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    disabled={!name.trim()}
                    onClick={handleUpdate}
                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all ${name.trim() ? 'bg-gradient-to-r from-[#abb4d9] to-[#cba6f7] text-[#11111b] shadow-[#abb4d9]/20' : 'bg-[#313244] text-[#585b70] cursor-not-allowed'}`}
                >
                    Save Changes
                </motion.button>
            </div>
        </div>
    );
};

export default EditGroupFlow;
