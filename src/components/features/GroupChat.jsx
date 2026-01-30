import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const GroupChat = ({ groupId, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (!groupId) return;

        // 1. Fetch initial messages
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    profiles (full_name, avatar_url)
                `)
                .eq('group_id', groupId)
                .order('created_at', { ascending: true });

            if (!error) setMessages(data);
            setLoading(false);
            scrollToBottom();
        };

        fetchMessages();

        // 2. Real-time subscription
        const subscription = supabase
            .channel(`chat:${groupId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `group_id=eq.${groupId}`
            }, async (payload) => {
                // Fetch the profile for the new message
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, avatar_url')
                    .eq('id', payload.new.sender_id)
                    .single();

                const messageWithProfile = { ...payload.new, profiles: profile };
                setMessages(current => [...current, messageWithProfile]);
                scrollToBottom();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [groupId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const content = newMessage.trim();
        setNewMessage('');

        const { error } = await supabase
            .from('messages')
            .insert([{
                group_id: groupId,
                sender_id: currentUser.id,
                content
            }]);

        if (error) {
            console.error('Error sending message:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-lavender border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-base/50 rounded-[32px] overflow-hidden border border-white/5">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 opacity-50">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="text-subtext/30" size={32} />
                        </div>
                        <p className="font-bold text-sm text-[#a6adc8]">No messages yet</p>
                        <p className="text-xs text-[#585b70] mt-1">Start a conversation with your group.</p>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isMe = msg.sender_id === currentUser.id;
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${isMe
                                    ? 'bg-lavender text-crust rounded-tr-none font-bold'
                                    : 'bg-surface1 text-white rounded-tl-none border border-white/5'
                                    }`}>
                                    {!isMe && (
                                        <p className="text-[10px] font-black uppercase opacity-50 mb-1">
                                            {msg.profiles?.full_name || 'Anonymous'}
                                        </p>
                                    )}
                                    <p>{msg.content}</p>
                                </div>
                                <span className="text-[8px] text-subtext mt-1 px-1">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </motion.div>
                        );
                    })
                )}
                <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-surface0/50 backdrop-blur-xl border-t border-white/5 flex gap-2">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-surface1/50 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-lavender/30 transition-all"
                />
                <button
                    type="submit"
                    className="w-12 h-12 bg-lavender text-crust rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default GroupChat;
