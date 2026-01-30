import React from 'react';
import { motion } from 'framer-motion';

const NavIcon = ({ icon, active, onClick }) => (
    <button
        onClick={onClick}
        className={`p-2 transition-all duration-300 relative ${active ? 'text-[#abb4d9]' : 'text-[#6c7086] hover:text-[#9399b2]'}`}
    >
        {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 2 })}
        {active && (
            <motion.div
                layoutId="nav-glow"
                className="absolute inset-0 bg-[#abb4d9]/15 blur-lg rounded-full -z-10"
            />
        )}
    </button>
);

export default NavIcon;
