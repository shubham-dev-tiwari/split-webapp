import React from 'react';
import { motion } from 'framer-motion';
import { Home, Users, History, Settings, Sparkles, UserPlus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const Sidebar = ({ currentTab, setView, setCurrentTab }) => (
    <aside className="hidden md:flex flex-col w-72 h-full glass-panel-heavy border-r border-white/5 p-6 shrink-0 rounded-3xl mr-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#cba6f7]/10 to-transparent pointer-events-none" />

        <div className="flex items-center gap-3 mb-12 px-2 relative z-10">
            <div className="w-10 h-10 bg-gradient-to-br from-[#abb4d9] to-[#cba6f7] rounded-xl flex items-center justify-center text-[#11111b] shadow-lg shadow-[#abb4d9]/20">
                <Sparkles size={20} className="text-[#11111b]" />
            </div>
            <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-[#a6adc8]">Lekha Jokha</h1>
        </div>

        <nav className="space-y-2 flex-1 relative z-10">
            {[
                { id: 'home', icon: <Home />, label: 'Dashboard' },
                { id: 'groups', icon: <Users />, label: 'Groups' },
                { id: 'social', icon: <UserPlus />, label: 'Social' },
                { id: 'history', icon: <History />, label: 'History' },
                { id: 'settings', icon: <Settings />, label: 'Settings' }
            ].map(item => {
                const { dbNotifications } = useAppStore();
                const unreadCount = dbNotifications.filter(n => !n.is_read).length;

                return (
                    <button
                        key={item.id}
                        onClick={() => { setView('dashboard'); setCurrentTab(item.id); }}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative overflow-hidden group ${currentTab === item.id
                            ? 'text-white'
                            : 'text-[#9399b2] hover:text-white'
                            }`}
                    >
                        {currentTab === item.id && (
                            <motion.div
                                layoutId="sidebar-active"
                                className="absolute inset-0 bg-white/5 border border-white/5 rounded-2xl shadow-inner"
                            />
                        )}
                        <div className="relative">
                            <span className="relative z-10 block transition-transform group-hover:scale-110">{React.cloneElement(item.icon, { size: 20 })}</span>
                            {item.id === 'social' && unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#f38ba8] rounded-full border-2 border-[#1e1e2e]" />
                            )}
                        </div>
                        <span className="relative z-10 font-bold tracking-wide">{item.label}</span>
                    </button>
                );
            })}
        </nav>

        <div className="mt-auto relative z-10">
            <div className="p-4 bg-[#11111b]/50 rounded-2xl flex items-center gap-3 border border-white/5 backdrop-blur-md">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f38ba8] to-[#fab387] flex items-center justify-center text-[#11111b] font-bold text-lg shadow-inner">
                    U
                </div>
                <div className="overflow-hidden">
                    <p className="font-bold text-sm truncate text-white">User Profile</p>
                    <p className="text-[10px] text-[#a6e3a1] uppercase tracking-wider font-bold">Standard Account</p>
                </div>
            </div>
        </div>
    </aside>
);

export default Sidebar;
