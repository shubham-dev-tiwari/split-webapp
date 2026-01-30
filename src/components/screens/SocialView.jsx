import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Bell, Users, Check, X, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import SpotlightCard from '@/components/ui/SpotlightCard';

const SocialView = () => {
    const { friends, pendingRequests, dbNotifications, sendFriendRequest, acceptFriendRequest, markNotifRead, currentUser } = useAppStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .ilike('full_name', `%${query}%`)
            .neq('id', currentUser.id)
            .limit(5);
        setSearchResults(data || []);
        setIsSearching(false);
    };

    return (
        <div className="p-6 space-y-8 pb-32">
            <header>
                <h1 className="text-3xl font-black text-white tracking-tight">Social</h1>
                <p className="text-[10px] uppercase tracking-widest text-[#585b70] font-black">FRIENDS & NOTIFICATIONS</p>
                <button
                    onClick={async () => {
                        await supabase.from('notifications').insert([{
                            receiver_id: currentUser.id,
                            sender_id: currentUser.id,
                            type: 'info',
                            content: 'Test notification working! 🚀'
                        }]);
                    }}
                    className="mt-4 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10"
                >
                    Test Realtime 🔔
                </button>
            </header>

            {/* Pending Requests Section (Persistent) */}
            {pendingRequests.length > 0 && (
                <section className="space-y-4">
                    <h3 className="text-xs font-bold text-[#fab387] uppercase tracking-widest flex items-center gap-2">
                        <Clock size={14} /> Pending Requests
                    </h3>
                    <div className="space-y-3">
                        {pendingRequests.map(req => (
                            <motion.div
                                key={req.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-[#313244] p-4 rounded-3xl border border-[#fab387]/20 flex items-center justify-between shadow-lg shadow-[#fab387]/5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#181825] flex items-center justify-center text-lg shadow-inner border border-white/5 overflow-hidden">
                                        {req.user?.avatar_url ? (
                                            <img src={req.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{req.user?.full_name[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white leading-snug">
                                            {req.user?.full_name}
                                        </p>
                                        <p className="text-[10px] text-[#585b70] font-black uppercase tracking-widest mt-1">
                                            Wants to be friends
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => acceptFriendRequest(req.user_id)}
                                        className="w-10 h-10 rounded-xl bg-[#a6e3a1] text-[#11111b] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#a6e3a1]/20"
                                    >
                                        <Check size={20} strokeWidth={3} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Notifications Section */}
            {dbNotifications.some(n => !n.is_read && n.type !== 'friend_request') && (
                <section className="space-y-4">
                    <h3 className="text-xs font-bold text-[#f38ba8] uppercase tracking-widest flex items-center gap-2">
                        <Bell size={14} /> Other Activity
                    </h3>
                    <div className="space-y-3">
                        {dbNotifications.filter(n => !n.is_read && n.type !== 'friend_request').map(n => (
                            <motion.div
                                key={n.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-[#313244] p-4 rounded-3xl border border-[#f38ba8]/20 flex items-center justify-between shadow-lg shadow-[#f38ba8]/5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#181825] flex items-center justify-center text-lg shadow-inner border border-white/5 overflow-hidden">
                                        {n.sender?.avatar_url ? (
                                            <img src={n.sender.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{n.sender?.full_name[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white leading-snug">
                                            {n.sender?.full_name} <span className="font-medium text-[#cdd6f4]/60">{n.content}</span>
                                        </p>
                                        <p className="text-[10px] text-[#585b70] font-black uppercase tracking-widest mt-1">
                                            {new Date(n.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                {n.type === 'friend_request' ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => acceptFriendRequest(n.sender_id, n.id)}
                                            className="w-10 h-10 rounded-xl bg-[#a6e3a1] text-[#11111b] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#a6e3a1]/20"
                                        >
                                            <Check size={20} strokeWidth={3} />
                                        </button>
                                        <button
                                            onClick={() => markNotifRead(n.id)}
                                            className="w-10 h-10 rounded-xl bg-white/5 text-[#f38ba8] flex items-center justify-center hover:bg-white/10 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => markNotifRead(n.id)}
                                        className="p-2 text-[#585b70] hover:text-white transition-colors"
                                    >
                                        <Check size={20} />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Friend Search */}
            <section className="space-y-4">
                <h3 className="text-xs font-bold text-lavender uppercase tracking-widest">Find Friends</h3>
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#585b70] group-focus-within:text-lavender transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full bg-white/5 border border-white/5 p-5 pl-14 rounded-[28px] text-white font-bold outline-none focus:border-lavender/40 focus:bg-white/10 transition-all shadow-xl"
                    />
                </div>

                <AnimatePresence>
                    {searchResults.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-2 mt-4"
                        >
                            {searchResults.map(user => (
                                <div key={user.id} className="bg-[#313244]/80 p-4 rounded-[24px] border border-white/5 flex items-center justify-between backdrop-blur-md">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-lavender/10 flex items-center justify-center text-sm font-bold text-lavender border border-lavender/20">
                                            {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" /> : user.full_name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{user.full_name}</p>
                                            <p className="text-[10px] text-[#585b70] font-bold uppercase tracking-widest">Registered User</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            sendFriendRequest(user.id);
                                            setSearchResults([]);
                                            setSearchQuery('');
                                        }}
                                        className="p-3 bg-lavender text-[#11111b] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-lavender/20"
                                    >
                                        <UserPlus size={20} strokeWidth={2.5} />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* My Friends List */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#abb4d9] uppercase tracking-widest px-1">Your Friends ({friends.length})</h3>
                    <Users size={16} className="text-[#585b70]" />
                </div>

                {friends.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {friends.map(friend => (
                            <SpotlightCard key={friend.id} className="p-4 flex items-center gap-4 bg-[#313244]/40 border border-white/5">
                                <div className="w-12 h-12 rounded-2xl bg-[#181825] flex items-center justify-center text-xl shadow-inner border border-white/5 overflow-hidden shrink-0">
                                    {friend.avatar_url ? (
                                        <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{friend.full_name?.[0]}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-white leading-tight truncate">{friend.full_name}</h4>
                                    <p className="text-[10px] text-[#585b70] font-black uppercase tracking-widest mt-0.5">Verified Friend</p>
                                </div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#a6e3a1] shadow-[0_0_8px_rgba(166,227,161,0.5)] shrink-0" />
                            </SpotlightCard>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center bg-[#313244]/20 rounded-[40px] border border-dashed border-white/10">
                        <Users className="mx-auto text-[#585b70] mb-3 opacity-20" size={32} />
                        <p className="text-[#a6adc8] font-bold text-sm mb-1">No friends yet</p>
                        <p className="text-[#585b70] text-[10px] font-black uppercase tracking-widest">Search above to find people!</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default SocialView;
