import { ChevronRight, Plus } from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';

const GroupsView = ({ groups, navigateToGroup, onCreateGroup }) => (
    <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 font-display">Your Groups</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map(g => (
                <SpotlightCard key={g.id} onClick={() => navigateToGroup(g)} className="flex items-center justify-between group cursor-pointer hover:border-[#abb4d9]/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                            {g.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-base truncate">{g.name}</h4>
                            <p className="text-[10px] text-[#9399b2] font-black uppercase tracking-wider opacity-60">
                                Admin: {g.owner?.full_name || 'Friend'}
                            </p>
                            <p className="text-[10px] text-[#a6adc8] font-medium truncate opacity-60">
                                {g.members.slice(0, 3).map(m => m.name).join(', ')}
                                {g.members.length > 3 ? ` +${g.members.length - 3}` : ''}
                            </p>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-[#45475a] shrink-0" />
                </SpotlightCard>
            ))}

            <button
                onClick={onCreateGroup}
                className="flex items-center justify-center gap-3 p-6 rounded-[32px] border-2 border-dashed border-white/5 bg-white/20 hover:bg-white/10 transition-colors group cursor-pointer"
            >
                <div className="w-10 h-10 rounded-full bg-[#313244] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Plus size={20} />
                </div>
                <span className="font-bold text-[#a6adc8] group-hover:text-white transition-colors">Create New Group</span>
            </button>
        </div>
    </div>
);

export default GroupsView;
