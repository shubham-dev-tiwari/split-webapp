import React from 'react';
import { motion } from 'framer-motion';
import { Home, Users, History, Settings, Plus, UserPlus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const MobileNavbar = ({ currentTab, onTabChange, onAdd }) => {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] pb-0">
            {/* The SVG Container */}
            <div className="relative w-full h-[100px] flex justify-center items-end filter drop-shadow-[0_-5px_10px_rgba(0,0,0,0.3)]">

                {/* Background SVG Shape */}
                <svg
                    viewBox="0 0 375 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute bottom-0 w-full h-[80px] text-[#181825]"
                    preserveAspectRatio="none"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M0 20C0 8.95431 8.9543 0 20 0H141.5C146.83 0 151.6 3.25 153.7 8.1L155.2 11.5C160.8 24.5 173.5 33 187.5 33C201.5 33 214.2 24.5 219.8 11.5L221.3 8.1C223.4 3.25 228.17 0 233.5 0H355C366.05 0 375 8.95431 375 20V80H0V20Z"
                        fill="currentColor"
                        className="opacity-95"
                    />
                </svg>

                {/* FAB */}
                <div className="absolute top-[3px] left-1/2 -translate-x-1/2 z-20">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={onAdd}
                        className="w-14 h-14 bg-[#abb4d9] text-[#11111b] rounded-full flex items-center justify-center shadow-lg shadow-[#abb4d9]/30"
                    >
                        <Plus size={28} strokeWidth={3} />
                    </motion.button>
                </div>

                {/* Icons Layer */}
                <div className="absolute bottom-0 w-full h-[80px] flex justify-between items-center px-6 z-10">
                    {/* Left Group */}
                    <div className="flex gap-10 pl-2">
                        <NavIcon
                            active={currentTab === 'home'}
                            icon={<Home size={24} strokeWidth={currentTab === 'home' ? 2.5 : 2} />}
                            onClick={() => onTabChange('home')}
                        />
                        <NavIcon
                            active={currentTab === 'groups'}
                            icon={<Users size={24} strokeWidth={currentTab === 'groups' ? 2.5 : 2} />}
                            onClick={() => onTabChange('groups')}
                        />
                    </div>

                    {/* Right Group */}
                    <div className="flex gap-10 pr-2">
                        {(() => {
                            const { dbNotifications } = useAppStore();
                            const unreadCount = dbNotifications.filter(n => !n.is_read).length;
                            return (
                                <NavIcon
                                    active={currentTab === 'social'}
                                    icon={<UserPlus size={24} strokeWidth={currentTab === 'social' ? 2.5 : 2} />}
                                    onClick={() => onTabChange('social')}
                                    badge={unreadCount > 0}
                                />
                            );
                        })()}
                        <NavIcon
                            active={currentTab === 'settings'}
                            icon={<Settings size={24} strokeWidth={currentTab === 'settings' ? 2.5 : 2} />}
                            onClick={() => onTabChange('settings')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const NavIcon = ({ active, icon, onClick, badge }) => (
    <button onClick={onClick} className="relative flex flex-col items-center justify-center h-full w-10">
        <motion.div
            animate={{
                color: active ? '#cba6f7' : '#9399b2',
                y: active ? -2 : 0
            }}
            className="mb-1 relative"
        >
            {icon}
            {badge && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#f38ba8] rounded-full border-2 border-[#181825]" />
            )}
        </motion.div>
        {active && (
            <motion.div
                layoutId="nav-line"
                className="absolute -top-3 w-8 h-1 rounded-full bg-[#cba6f7] shadow-[0_0_8px_rgba(203,166,247,0.6)]"
            />
        )}
    </button>
);

export default MobileNavbar;
