import React from 'react';
import { Flame, Wine, Utensils } from 'lucide-react';

export const INITIAL_GROUPS = [];

export const PRESETS = [
    { id: 'tobacco', name: 'Tobacco', desc: 'Consumables & Essentials', icon: <Flame size={24} />, color: 'text-[#fab387]', bg: 'bg-[#fab387]/10', border: 'border-[#fab387]/20', gradient: 'from-[#fab387]/10 via-[#fab387]/5 to-transparent' },
    { id: 'beverages', name: 'Beverages', desc: 'Refreshments & Drinks', icon: <Wine size={24} />, color: 'text-[#cba6f7]', bg: 'bg-[#cba6f7]/10', border: 'border-[#cba6f7]/20', gradient: 'from-[#cba6f7]/10 via-[#cba6f7]/5 to-transparent' },
    { id: 'dining', name: 'Dining', desc: 'Meals & Catering', icon: <Utensils size={24} />, color: 'text-[#a6e3a1]', bg: 'bg-[#a6e3a1]/10', border: 'border-[#a6e3a1]/20', gradient: 'from-[#a6e3a1]/10 via-[#a6e3a1]/5 to-transparent' },
];
