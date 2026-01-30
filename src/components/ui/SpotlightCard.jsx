import React from 'react';
import { motion } from 'framer-motion';

const SpotlightCard = ({ children, className = "", onClick }) => {
    return (
        <motion.div
            onClick={onClick}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden glass-panel rounded-3xl p-5 border border-white/5 group cursor-pointer ${className}`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
};

export default SpotlightCard;
