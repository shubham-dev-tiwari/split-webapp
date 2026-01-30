import React from 'react';
import { X } from 'lucide-react';

const SheetHeader = ({ title, onClose, icon }) => (
    <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            {icon && (
                <div className="text-[#abb4d9] flex size-10 shrink-0 items-center justify-center bg-[#abb4d9]/10 rounded-full">
                    {icon}
                </div>
            )}
            <h2 className="text-2xl font-bold font-display tracking-tight text-white">{title}</h2>
        </div>
        <button onClick={onClose} className="p-2 bg-[#313244] rounded-full text-[#a6adc8] hover:text-white hover:bg-[#45475a] transition-colors">
            <X size={20} />
        </button>
    </div>
);

export default SheetHeader;
