import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const BottomSheet = ({ isOpen, onClose, title, children }) => (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-[#000000]/60 backdrop-blur-md z-[70]"
                />
                <motion.div
                    initial={{ y: '100%', opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: '100%', opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="fixed z-[80] glass-panel-heavy shadow-2xl shadow-black/50 border-t border-white/10 
            inset-0 flex flex-col pointer-events-auto
            md:inset-0 md:rounded-none md:border-0"
                >
                    <div className="md:hidden w-12 h-1.5 bg-white/20 rounded-full mx-auto my-4 shrink-0" />
                    {title && (
                        <div className="flex justify-between items-center px-6 pt-6 md:pt-8 md:px-8 mb-4 shrink-0 max-w-2xl mx-auto w-full">
                            <h2 className="text-2xl font-bold font-display tracking-tight">{title}</h2>
                            <button onClick={onClose} className="hidden md:flex p-3 hover:bg-white/10 rounded-full transition-colors text-[#a6adc8] hover:text-white bg-[#11111b]/50">
                                <X size={24} />
                            </button>
                        </div>
                    )}
                    {children}
                </motion.div>
            </>
        )}
    </AnimatePresence>
);

export default BottomSheet;
