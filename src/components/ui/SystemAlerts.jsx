import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ notification }) => {
    const icons = {
        success: <CheckCircle size={18} className="text-[#a6e3a1]" />,
        error: <AlertCircle size={18} className="text-[#f38ba8]" />,
        info: <Info size={18} className="text-[#74c7ec]" />,
        reminder: <Bell size={18} className="text-[#fab387]" />
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="flex items-center gap-3 px-6 py-4 bg-[#1e1e2e]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl min-w-[300px]"
        >
            <div className="shrink-0">
                {icons[notification.type] || icons.info}
            </div>
            <p className="text-sm font-bold text-white leading-tight">
                {notification.message}
            </p>
        </motion.div>
    );
};

const SystemAlerts = () => {
    const { notifications } = useAppStore();

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {notifications.map(n => (
                    <div key={n.id} className="pointer-events-auto">
                        <Toast notification={n} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default SystemAlerts;
