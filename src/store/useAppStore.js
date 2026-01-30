import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export const useAppStore = create((set, get) => ({
    // State
    groups: [],
    expenses: [],
    pinnedPresets: [
        { id: 'tobacco', name: 'Tobacco', icon: '🚬' },
        { id: 'beverages', name: 'Beverages', icon: '🍺' }
    ],
    currentUser: null,
    userTotals: { owes: 0, owed: 0 },
    systemAlerts: [],
    systemAlerts: [],
    friends: [],
    pendingRequests: [],
    dbNotifications: [],

    // Actions
    fetchData: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        set({ currentUser: user });

        // 1. Fetch groups and their members
        const { data: groupMembers, error: gmError } = await supabase
            .from('group_members')
            .select(`
                group_id,
                groups (*, owner:profiles(full_name, avatar_url)),
                profiles (*)
            `)
            .eq('profile_id', user.id);

        if (gmError) {
            console.error('Error fetching groups:', gmError);
            return;
        }

        // Aggregate groups and their members
        const groupMap = {};
        groupMembers.forEach(gm => {
            if (!groupMap[gm.group_id]) {
                groupMap[gm.group_id] = { ...gm.groups, members: [] };
            }
        });

        const groupIds = Object.keys(groupMap);

        // Fetch ALL members for these groups
        const { data: allMembers, error: amError } = await supabase
            .from('group_members')
            .select('id, group_id, display_name, profiles(*)')
            .in('group_id', groupIds);

        if (!amError) {
            allMembers.forEach(m => {
                if (groupMap[m.group_id]) {
                    groupMap[m.group_id].members.push({
                        id: m.profiles?.id || `shadow-${m.id}`,
                        name: m.profiles?.full_name || m.display_name || 'Anonymous Member',
                        avatar: m.profiles?.avatar_url,
                        is_real: !!m.profiles
                    });
                }
            });
        }

        const groups = Object.values(groupMap);

        const { data: expenses, error: expError } = await supabase
            .from('expenses')
            .select('*')
            .in('group_id', groupIds)
            .order('created_at', { ascending: false });

        if (expError) {
            console.error('Error fetching expenses:', expError);
            return;
        }

        // 3. Calculate balances and user totals
        let globalTotalOwes = 0;
        let globalTotalOwed = 0;

        const groupsWithBalance = groups.map(group => {
            const groupExpenses = expenses.filter(e => e.group_id === group.id);
            let totalNetBalance = 0;

            groupExpenses.forEach(exp => {
                const splitType = exp.split_type || 'equal';
                const splitData = exp.split_data || {};
                const splitList = exp.split_list || [];
                const involved = splitList.includes(user.id) || !!splitData[user.id];

                let myShare = 0;
                if (involved) {
                    if (splitType === 'equal') {
                        const shareCount = splitList.length || 1;
                        myShare = exp.amount / shareCount;
                    } else if (splitType === 'percentage') {
                        const pct = splitData[user.id] || 0;
                        myShare = (exp.amount * pct) / 100;
                    } else if (splitType === 'portion') {
                        const myPortion = splitData[user.id] || 0;
                        const totalPortions = splitList.reduce((acc, mId) => acc + (splitData[mId] || 0), 0) || 1;
                        myShare = (exp.amount * myPortion) / totalPortions;
                    }
                }

                if (exp.payer_id === user.id) {
                    const othersShare = exp.amount - (involved ? myShare : 0);
                    totalNetBalance += othersShare;
                    globalTotalOwed += othersShare;
                } else if (involved) {
                    totalNetBalance -= myShare;
                    globalTotalOwes += myShare;
                }
            });

            return { ...group, balance: totalNetBalance };
        });

        // 4. Fetch Friends (Accepted)
        const { data: friendships } = await supabase
            .from('friendships')
            .select(`
                *,
                user:profiles!friendships_user_id_fkey(*),
                friend:profiles!friendships_friend_id_fkey(*)
            `)
            .eq('status', 'accepted')
            .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

        const friendsList = friendships?.map(f => f.user_id === user.id ? f.friend : f.user) || [];

        // 5. Fetch Pending Requests
        const { data: pending } = await supabase
            .from('friendships')
            .select(`
                *,
                user:profiles!friendships_user_id_fkey(*)
            `)
            .eq('status', 'pending')
            .eq('friend_id', user.id);

        // 6. Fetch Notifications
        const { data: dbNotifs } = await supabase
            .from('notifications')
            .select('*, sender:profiles(*), group:groups(*)')
            .eq('receiver_id', user.id)
            .order('created_at', { ascending: false });

        set({
            groups: groupsWithBalance,
            expenses,
            friends: friendsList,
            pendingRequests: pending || [],
            dbNotifications: dbNotifs || [],
            userTotals: {
                owes: globalTotalOwes,
                owed: globalTotalOwed
            }
        });

        // Subscribe to changes if not already subscribed
        if (!get().isSubscribed) {
            get().subscribeToExpenses();
        }
    },

    isSubscribed: false,
    subscribeToExpenses: () => {
        const subscription = supabase
            .channel('db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
                get().fetchData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, () => {
                get().fetchData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members' }, () => {
                get().fetchData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => {
                get().fetchData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
                get().fetchData();
            })
            .subscribe();

        set({ isSubscribed: true });
    },

    addGroup: async (groupData) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error("No user found in addGroup");
                return;
            }

            // 1. Create group
            const { data: group, error: gError } = await supabase
                .from('groups')
                .insert([{
                    name: groupData.name,
                    emoji: groupData.emoji,
                    budget: groupData.budget || 0,
                    owner_id: user.id
                }])
                .select()
                .single();

            if (gError) {
                console.error("Error creating group:", gError);
                throw gError;
            }

            // 2. Add owner as member
            const membersToInsert = [
                {
                    group_id: group.id,
                    profile_id: user.id
                },
                ...groupData.members.map(m => ({
                    group_id: group.id,
                    profile_id: m.is_real ? m.id : null,
                    display_name: m.name
                }))
            ];

            const { error: mError } = await supabase
                .from('group_members')
                .insert(membersToInsert);

            if (mError) {
                console.error("Error adding members to group:", mError);
                throw mError;
            }

            // 3. Notify real members
            const realMembers = groupData.members.filter(m => m.is_real);
            if (realMembers.length > 0) {
                const notifications = realMembers.map(m => ({
                    receiver_id: m.id,
                    sender_id: user.id,
                    type: 'group_invite',
                    group_id: group.id,
                    content: `added you to group "${group.name}"`
                }));
                await supabase.from('notifications').insert(notifications);
            }

            console.log("Group created successfully:", group.name);
            await get().fetchData();
        } catch (error) {
            console.error("Critical error in addGroup:", error);
            alert("Failed to create group: " + error.message);
        }
    },

    addExpense: async (expenseData) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // If no split_list provided, default to all members of the group
            const splitList = expenseData.splitList ||
                get().groups.find(g => g.id === expenseData.groupId)?.members.map(m => m.id) ||
                [user.id];

            const { error } = await supabase
                .from('expenses')
                .insert([{
                    group_id: expenseData.groupId,
                    payer_id: expenseData.payerId || user.id,
                    amount: parseFloat(expenseData.amount),
                    description: expenseData.desc || 'Expense',
                    type: expenseData.type || 'custom',
                    split_type: expenseData.splitType || 'equal',
                    split_data: expenseData.splitData || {},
                    split_list: expenseData.splitList || [],
                    created_at: expenseData.date || new Date().toISOString()
                }]);

            if (error) throw error;
            await get().fetchData();
        } catch (error) {
            console.error("Error adding expense:", error);
            alert("Failed to record expense.");
        }
    },

    deleteExpense: async (id) => {
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await get().fetchData();
    },

    deleteGroup: async (id) => {
        const { error } = await supabase
            .from('groups')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await get().fetchData();
    },

    settleUp: async (groupId) => {
        try {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('group_id', groupId);

            if (error) throw error;
            await get().fetchData();
        } catch (error) {
            console.error("Error settling up:", error);
            alert("Failed to settle balances.");
        }
    },

    updateExpense: async (id, expenseData) => {
        try {
            const { error } = await supabase
                .from('expenses')
                .update({
                    amount: parseFloat(expenseData.amount),
                    description: expenseData.desc,
                    type: expenseData.type,
                    payer_id: expenseData.payerId,
                    split_type: expenseData.splitType,
                    split_data: expenseData.splitData,
                    split_list: expenseData.splitList,
                    created_at: expenseData.date
                })
                .eq('id', id);

            if (error) throw error;
            await get().fetchData();
        } catch (error) {
            console.error("Error updating expense:", error);
            alert("Failed to update expense.");
        }
    },

    addNotification: (message, type = 'info') => {
        const id = Date.now();
        set(state => ({
            systemAlerts: [...state.systemAlerts, { id, message, type }]
        }));
        setTimeout(() => {
            set(state => ({
                systemAlerts: state.systemAlerts.filter(n => n.id !== id)
            }));
        }, 3000);
    },

    // SOCIAL ACTIONS
    sendFriendRequest: async (targetUserId) => {
        try {
            const { currentUser, addNotification } = get();
            if (!currentUser) return;

            // Check if already friends or pending
            const { data: existing } = await supabase
                .from('friendships')
                .select('*')
                .or(`and(user_id.eq.${currentUser.id},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${currentUser.id})`)
                .single();

            if (existing) {
                addNotification("Request already sent or already friends!", "info");
                return;
            }

            const { error: fError } = await supabase
                .from('friendships')
                .insert([{ user_id: currentUser.id, friend_id: targetUserId, status: 'pending' }]);

            if (fError) throw fError;

            // Create notification for the receiver
            await supabase.from('notifications').insert([{
                receiver_id: targetUserId,
                sender_id: currentUser.id,
                type: 'friend_request',
                content: 'sent you a friend request'
            }]);

            addNotification("Friend request sent! ✨", "success");
        } catch (error) {
            console.error("Error sending friend request:", error);
            get().addNotification("Failed to send request", "error");
        }
    },

    acceptFriendRequest: async (senderId, notifId = null) => {
        try {
            const { currentUser, fetchData } = get();

            // 1. Update friendship status
            await supabase
                .from('friendships')
                .update({ status: 'accepted' })
                .eq('user_id', senderId)
                .eq('friend_id', currentUser.id);

            // 2. Mark notification as read (if provided)
            if (notifId) {
                await supabase
                    .from('notifications')
                    .update({ is_read: true })
                    .eq('id', notifId);
            }

            // 3. Notify sender
            await supabase.from('notifications').insert([{
                receiver_id: senderId,
                sender_id: currentUser.id,
                type: 'friend_accept',
                content: 'accepted your friend request'
            }]);

            await fetchData();
        } catch (error) {
            console.error("Error accepting friend request:", error);
        }
    },

    markNotifRead: async (notifId) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
        set(state => ({
            dbNotifications: state.dbNotifications.map(n => n.id === notifId ? { ...n, is_read: true } : n)
        }));
    },

    joinGroup: async (groupId) => {
        try {
            const { currentUser, addNotification, fetchData } = get();
            if (!currentUser) throw new Error("Must be logged in to join");

            // Check if already a member
            const { data: existing } = await supabase
                .from('group_members')
                .select('id')
                .eq('group_id', groupId)
                .eq('profile_id', currentUser.id)
                .single();

            if (existing) {
                addNotification("You are already a member of this group!", "info");
                return;
            }

            const { error } = await supabase
                .from('group_members')
                .insert([{
                    group_id: groupId,
                    profile_id: currentUser.id,
                    display_name: currentUser.user_metadata?.full_name || currentUser.email
                }]);

            if (error) throw error;

            addNotification("Welcome to the group! 🎉", "success");
            await fetchData();
        } catch (error) {
            console.error("Error joining group:", error);
            get().addNotification("Failed to join group", "error");
        }
    },

    updateGroup: async (id, groupData) => {
        try {
            const { groups } = get();
            const originalGroup = groups.find(g => g.id === id);
            if (!originalGroup) return;

            // 1. Update basic group info
            const { error: gError } = await supabase
                .from('groups')
                .update({
                    name: groupData.name,
                    emoji: groupData.emoji,
                    budget: parseFloat(groupData.budget || 0)
                })
                .eq('id', id);

            if (gError) throw gError;

            // 2. Sync members
            const newMembersList = groupData.members || [];
            const originalMembersList = originalGroup.members || [];

            // A. Identify removals
            const memberIdsToRemove = originalMembersList
                .filter(om => !newMembersList.some(nm => nm.id === om.id))
                .filter(om => !om.id.startsWith('shadow-')) // Don't try to delete shadow IDs directly if they are unstable
                .map(om => om.id);

            // For shadow members, we need to delete by the underlying record ID if we can find it
            // but fetchData already gives us the surrogate ID for shadows in m.id
            // Let's refine the fetch logic later if needed, but for now we delete by profile_id OR our known shadow mechanics

            if (memberIdsToRemove.length > 0) {
                // Determine which are profile_ids and which are surrogate id (for guests)
                const profileIds = memberIdsToRemove.filter(mid => !mid.startsWith('shadow-') && mid.length > 20);
                const surrogateIds = memberIdsToRemove.filter(mid => mid.startsWith('shadow-')).map(mid => mid.replace('shadow-', ''));

                if (profileIds.length > 0) {
                    await supabase.from('group_members').delete().eq('group_id', id).in('profile_id', profileIds);
                }
                if (surrogateIds.length > 0) {
                    await supabase.from('group_members').delete().eq('group_id', id).in('id', surrogateIds);
                }
            }

            // B. Identify additions
            const additions = newMembersList.filter(nm => nm.is_new);
            if (additions.length > 0) {
                const toInsert = additions.map(a => ({
                    group_id: id,
                    profile_id: a.is_real ? a.id : null,
                    display_name: a.name
                }));
                await supabase.from('group_members').insert(toInsert);

                // Notifications for real users
                const { currentUser } = get();
                const realNewMembers = additions.filter(a => a.is_real);
                if (realNewMembers.length > 0) {
                    const notifications = realNewMembers.map(m => ({
                        receiver_id: m.id,
                        sender_id: currentUser.id, // Assuming currentUser triggers this update
                        type: 'group_invite',
                        group_id: id,
                        content: `added you to group "${groupData.name || originalGroup.name}"`
                    }));
                    await supabase.from('notifications').insert(notifications);
                }
            }

            console.log("Group updated successfully");
            await get().fetchData();
        } catch (error) {
            console.error("Error updating group:", error);
            alert("Failed to save group updates: " + error.message);
        }
    },

    shareSettlement: (groupId) => {
        const group = get().groups.find(g => g.id === groupId);
        if (!group) return;

        const expenses = get().expenses.filter(e => e.group_id === groupId);
        const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

        let message = `*Ledger: ${group.emoji} ${group.name}*\n\n`;
        message += `Total Spending: ₹${total}\n`;
        message += `\nCheck karo app mein: ${window.location.origin}`;

        const encoded = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encoded}`, '_blank');
    },

    togglePin: (preset) => set((state) => {
        const isPinned = state.pinnedPresets.some(p => p.id === preset.id);
        if (isPinned) {
            return { pinnedPresets: state.pinnedPresets.filter(p => p.id !== preset.id) };
        } else {
            return { pinnedPresets: [...state.pinnedPresets, preset] };
        }
    }),

    // Debt Simplification Logic
    simplifyDebts: (groupId) => {
        const { expenses, groups, currentUser } = get();
        const group = groups.find(g => g.id === groupId);
        if (!group || !currentUser) return [];

        const groupExpenses = expenses.filter(e => e.group_id === groupId);
        const netBalances = {}; // { memberId: balance }

        // Initialize balances for all members (including shadow members)
        group.members.forEach(m => {
            netBalances[m.id] = 0;
        });

        groupExpenses.forEach(exp => {
            const splitType = exp.split_type || 'equal';
            const splitData = exp.split_data || {};
            const splitList = exp.split_list || [];

            // Calculate shares for everyone involved
            const membersToIterate = splitType === 'equal' ? splitList : Object.keys(splitData);

            membersToIterate.forEach(mId => {
                let share = 0;
                if (splitType === 'equal') {
                    share = exp.amount / (splitList.length || 1);
                } else if (splitType === 'percentage') {
                    share = (exp.amount * (splitData[mId] || 0)) / 100;
                } else if (splitType === 'portion') {
                    const totalPortions = Object.values(splitData).reduce((a, b) => a + b, 0) || 1;
                    share = (exp.amount * (splitData[mId] || 0)) / totalPortions;
                }

                // If mId is not the payer, they owe 'share' to the payer
                if (mId !== exp.payer_id) {
                    netBalances[mId] -= share;
                    netBalances[exp.payer_id] += share;
                }
            });
        });

        // Split into debtors and creditors
        const debtors = [];
        const creditors = [];

        Object.entries(netBalances).forEach(([mId, balance]) => {
            if (balance < -0.01) debtors.push({ id: mId, balance: Math.abs(balance) });
            else if (balance > 0.01) creditors.push({ id: mId, balance });
        });

        // Greedy algorithm to minimize transfers
        const transfers = [];
        let dIdx = 0;
        let cIdx = 0;

        while (dIdx < debtors.length && cIdx < creditors.length) {
            const debtor = debtors[dIdx];
            const creditor = creditors[cIdx];
            const amount = Math.min(debtor.balance, creditor.balance);

            transfers.push({
                from: debtor.id,
                fromName: group.members.find(m => m.id === debtor.id)?.name || 'Unknown',
                to: creditor.id,
                toName: group.members.find(m => m.id === creditor.id)?.name || 'Unknown',
                amount
            });

            debtor.balance -= amount;
            creditor.balance -= amount;

            if (debtor.balance < 0.01) dIdx++;
            if (creditor.balance < 0.01) cIdx++;
        }

        return transfers;
    },

    shareNudge: (transfer) => {
        const message = `Hey ${transfer.fromName}! Reminder to settle ₹${Math.round(transfer.amount)} on Lekha Jokha for our group expense. Check here: ${window.location.origin}`;
        const encoded = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encoded}`, '_blank');
        get().addNotification(`Reminder sent via WhatsApp!`, 'reminder');
    }
}));
