import { ChevronRight, Plus } from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';

const GroupsView = ({ groups, navigateToGroup, onCreateGroup }) => (
    <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 font-display">Your Groups</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map(g => (
                <SpotlightCard key={g.id} onClick={() => navigateToGroup(g)} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-2xl">{g.emoji}</div>
                        <p className="font-bold text-white">{g.name}</p>
                    </div>
                    <ChevronRight size={18} className="text-[#45475a]" />
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
