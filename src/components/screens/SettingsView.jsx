import { ChevronRight, Trash2, LogOut } from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';

const SettingsView = () => {
    const { userTotals, currentUser } = useAppStore();

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold font-display">Profile & Settings</h2>

            <div className="space-y-4 max-w-xl mx-auto md:mx-0">
                {/* Global Debt Summary */}
                <SpotlightCard className="p-0 overflow-hidden">
                    <div className="p-6 bg-gradient-to-br from-[#1e1e2e] to-[#11111b] border-b border-white/5">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-[#abb4d9]/10 flex items-center justify-center text-2xl font-black text-[#abb4d9] border border-[#abb4d9]/20">
                                {(currentUser?.user_metadata?.full_name || 'U')[0]}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{currentUser?.user_metadata?.full_name || 'Lekha Jokha User'}</h3>
                                <p className="text-xs text-[#585b70] font-black uppercase tracking-widest">{currentUser?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#11111b] p-4 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black text-[#a6e3a1] uppercase mb-1">Total Owed to You</p>
                                <p className="text-2xl font-black text-white">₹{Math.round(userTotals?.owed || 0).toLocaleString('en-IN')}</p>
                            </div>
                            <div className="bg-[#11111b] p-4 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black text-[#f38ba8] uppercase mb-1">Total You Owe</p>
                                <p className="text-2xl font-black text-white">₹{Math.round(userTotals?.owes || 0).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>
                </SpotlightCard>

                <div className="space-y-3">
                    {['Preferences', 'Notifications', 'Security'].map(opt => (
                        <SpotlightCard key={opt} className="flex items-center justify-between py-4">
                            <span className="font-bold text-white/80">{opt}</span>
                            <ChevronRight size={16} className="text-[#a6adc8]" />
                        </SpotlightCard>
                    ))}

                    <SpotlightCard
                        onClick={async () => {
                            await supabase.auth.signOut();
                        }}
                        className="flex items-center justify-between py-4 border-[#cba6f7]/20 bg-[#cba6f7]/5 cursor-pointer hover:bg-[#cba6f7]/10 transition-colors"
                    >
                        <div className="flex items-center gap-3 text-[#cba6f7]">
                            <LogOut size={18} />
                            <span className="font-bold">Logout Session</span>
                        </div>
                    </SpotlightCard>

                    <SpotlightCard
                        onClick={() => {
                            if (confirm('Are you sure? This will delete all local preferences!')) {
                                localStorage.clear();
                                window.location.reload();
                            }
                        }}
                        className="flex items-center justify-between py-4 border-[#f38ba8]/20 bg-[#f38ba8]/5 cursor-pointer hover:bg-[#f38ba8]/10 transition-colors"
                    >
                        <div className="flex items-center gap-3 text-[#f38ba8]">
                            <Trash2 size={18} />
                            <span className="font-bold">Reset Preferences</span>
                        </div>
                    </SpotlightCard>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
