import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, Users, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import SpotlightCard from '@/components/ui/SpotlightCard';

const JoinGroupOverlay = ({ groupId, onClose }) => {
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const { joinGroup, currentUser, addNotification } = useAppStore();

    useEffect(() => {
        const fetchGroup = async () => {
            const { data, error } = await supabase
                .from('groups')
                .select('*, group_members(count)')
                .eq('id', groupId)
                .single();

            if (!error && data) {
                setGroup(data);
            } else {
                addNotification("Invalid or expired invite link", "error");
                onClose();
            }
            setLoading(false);
        };

        if (groupId) fetchGroup();
    }, [groupId]);

    const handleJoin = async () => {
        if (!currentUser) {
            addNotification("Please sign in to join groups!", "info");
            return;
        }
        setJoining(true);
        await joinGroup(groupId);
        setJoining(false);
        onClose();
    };

    if (loading) return null;
    if (!group) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#11111b]/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <SpotlightCard className="p-0 overflow-hidden border border-white/10 shadow-2xl bg-[#1e1e2e]">
                    <div className="p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-lavender/10 rounded-[32px] flex items-center justify-center text-4xl mx-auto border border-lavender/20 shadow-inner">
                            {group.emoji || '👥'}
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white leading-tight">Join "{group.name}"?</h2>
                            <p className="text-[#a6adc8] text-sm font-medium">You've been invited to join this group ledger.</p>
                        </div>

                        <div className="flex items-center justify-center gap-6 py-4">
                            <div className="flex flex-col items-center gap-1">
                                <Users size={20} className="text-mauve" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#585b70]">
                                    {group.group_members?.[0]?.count || 0} Members
                                </span>
                            </div>
                            <div className="w-px h-8 bg-white/5" />
                            <div className="flex flex-col items-center gap-1">
                                <CheckCircle2 size={20} className="text-green-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#585b70]">
                                    Official Invite
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4">
                            <button
                                onClick={onClose}
                                className="py-4 bg-white/5 text-[#a6adc8] rounded-2xl font-bold border border-white/5 hover:bg-white/10 transition-colors"
                            >
                                Decline
                            </button>
                            <button
                                onClick={handleJoin}
                                disabled={joining}
                                className="py-4 bg-lavender text-crust rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-lavender/20 disabled:opacity-50"
                            >
                                {joining ? "Joining..." : (
                                    <>
                                        <UserPlus size={20} strokeWidth={3} />
                                        Join Group
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </SpotlightCard>
            </motion.div>
        </div>
    );
};

export default JoinGroupOverlay;
