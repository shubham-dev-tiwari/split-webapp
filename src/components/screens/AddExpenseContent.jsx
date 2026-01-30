import React from 'react';
import { PRESETS } from '@/lib/constants';

const AddExpenseContent = () => {
    return (
        <div className="grid grid-cols-2 gap-4">
            {PRESETS.map(p => (
                <button key={p.id} className="bg-surface0 p-8 rounded-[32px] flex flex-col items-center gap-4 border border-white/5 active:scale-95 transition-all">
                    <div className={`p-4 rounded-2xl ${p.bg} ${p.color}`}>
                        {React.cloneElement(p.icon, { size: 32 })}
                    </div>
                    <span className="font-bold text-lg text-white">{p.name}</span>
                </button>
            ))}
        </div>
    );
};

export default AddExpenseContent;
