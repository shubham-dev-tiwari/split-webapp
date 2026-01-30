"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Home, Users, History, Settings } from 'lucide-react';

// Layout Components
import Sidebar from '@/components/layout/Sidebar';
import NavIcon from '@/components/layout/NavIcon';
import MobileNavbar from '@/components/layout/MobileNavbar';

// UI Components
import BottomSheet from '@/components/ui/BottomSheet';
import SystemAlerts from '@/components/ui/SystemAlerts';

// Screen Components
import Landing from '@/components/screens/Landing';
import HomeView from '@/components/screens/HomeView';
import GroupsView from '@/components/screens/GroupsView';
import HistoryView from '@/components/screens/HistoryView';
import SettingsView from '@/components/screens/SettingsView';
import GroupDetailView from '@/components/screens/GroupDetailView';

// Feature Components
import AddExpenseFlow from '@/components/features/AddExpenseFlow';
import CreateGroupFlow from '@/components/features/CreateGroupFlow';
import EditGroupFlow from '@/components/features/EditGroupFlow';
import JoinGroupOverlay from '@/components/features/JoinGroupOverlay';
import AuthFlow from '@/components/features/AuthFlow';

// Supabase
import { supabase } from '@/lib/supabase';

// Constants
import { INITIAL_GROUPS } from '@/lib/constants';

// Stores
import { useAppStore } from '@/store/useAppStore';

// --- Main App ---

export default function App() {
    const [view, setView] = useState('landing');
    const [currentTab, setCurrentTab] = useState('home');
    const { groups, addExpense, addGroup, fetchData, currentUser } = useAppStore();
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [showEditGroup, setShowEditGroup] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [showAuth, setShowAuth] = useState(false);
    const [session, setSession] = useState(null);
    const [initializing, setInitializing] = useState(true);
    const [inviteGroupId, setInviteGroupId] = useState(null);

    // Initial session check & listener
    useEffect(() => {
        const initSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if (session) {
                setView('dashboard');
                await fetchData();
            }
            setInitializing(false);
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            if (session) {
                setView('dashboard');
                setShowAuth(false);
                fetchData();
            } else if (event === 'SIGNED_OUT') {
                setView('landing');
            }
        });

        return () => subscription.unsubscribe();
    }, [fetchData]);

    // Handle invite links
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const inviteId = params.get('invite');
        if (inviteId) {
            setInviteGroupId(inviteId);
            // Clear the param from URL
            const nextUrl = window.location.pathname;
            window.history.replaceState({}, '', nextUrl);
        }
    }, []);

    // Derived state
    const totalBalance = useMemo(() => groups.reduce((acc, g) => acc + g.balance, 0), [groups]);

    const handleAddExpense = (expenseData) => {
        if (editingExpense) {
            useAppStore.getState().updateExpense(editingExpense.id, {
                ...expenseData,
                groupId: editingExpense.group_id
            });
            useAppStore.getState().addNotification(`Expense updated successfully!`, 'success');
            setEditingExpense(null);
        } else {
            const expense = {
                ...expenseData,
                groupId: selectedGroup?.id || groups[0]?.id,
                groupName: selectedGroup?.name || groups[0]?.name,
                payer: 'Tu'
            };
            addExpense(expense);
            useAppStore.getState().addNotification(`Expense recorded!`, 'success');
        }
        setShowAdd(false);
    };

    const handleCreateGroup = (groupData) => {
        addGroup(groupData);
        useAppStore.getState().addNotification(`Group "${groupData.name}" created!`, 'success');
        setShowCreateGroup(false);
    };

    const handleUpdateGroup = (id, data) => {
        useAppStore.getState().updateGroup(id, data);
        setSelectedGroup({ ...selectedGroup, ...data });
        setShowEditGroup(false);
    };

    const handleDeleteGroup = (id) => {
        useAppStore.getState().deleteGroup(id);
        setView('dashboard');
        setShowEditGroup(false);
    };

    const navigateToGroup = (group) => {
        setSelectedGroup(group);
        setView('group-detail');
    };

    if (initializing) {
        return (
            <div className="h-screen bg-[#11111b] flex flex-col items-center justify-center space-y-4">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-6xl"
                >
                    🚀
                </motion.div>
                <div className="space-y-1 text-center">
                    <h1 className="text-2xl font-black text-white tracking-tight">Lekha Jokha</h1>
                    <p className="text-[10px] uppercase tracking-widest text-[#585b70] font-black">Restoring Session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`h-screen bg-[#11111b] text-[#cdd6f4] flex flex-col relative ${view === 'landing' ? 'overflow-y-auto' : 'overflow-hidden'} selection:bg-[#abb4d9]/30 font-sans 
      md:flex-row md:max-w-7xl md:mx-auto md:p-6 md:gap-0`}>
            <div className="grain-overlay" />

            {view === 'landing' && !session ? (
                <Landing onStart={() => setShowAuth(true)} />
            ) : (
                <>
                    <div className="aurora-bg hidden md:block" />

                    {/* Desktop Sidebar */}
                    <Sidebar currentTab={currentTab} setView={setView} setCurrentTab={setCurrentTab} />

                    {/* Main Content Area */}
                    <main className="flex-1 flex flex-col h-full overflow-hidden relative md:rounded-[40px] md:glass-panel  md:shadow-2xl z-10">
                        <div className="flex-1 overflow-y-auto no-scrollbar md:p-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={view + (selectedGroup?.id || '') + currentTab}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="h-full max-w-md mx-auto md:max-w-5xl"
                                >
                                    {view === 'dashboard' && (
                                        <>
                                            {currentTab === 'home' && <HomeView groups={groups} balance={totalBalance} onSelectGroup={navigateToGroup} />}
                                            {currentTab === 'groups' && <GroupsView groups={groups} navigateToGroup={navigateToGroup} onCreateGroup={() => setShowCreateGroup(true)} />}
                                            {currentTab === 'history' && <HistoryView />}
                                            {currentTab === 'settings' && <SettingsView />}
                                        </>
                                    )}

                                    {view === 'group-detail' && selectedGroup && (
                                        <GroupDetailView
                                            group={selectedGroup}
                                            onBack={() => setView('dashboard')}
                                            onEdit={() => setShowEditGroup(true)}
                                            onEditExpense={(expense) => {
                                                setEditingExpense(expense);
                                                setShowAdd(true);
                                            }}
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Mobile Bottom Nav */}
                        <MobileNavbar
                            currentTab={currentTab}
                            onTabChange={(tab) => { setView('dashboard'); setCurrentTab(tab); }}
                            onAdd={() => setShowAdd(true)}
                        />
                    </main>

                    {/* Desktop FAB */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="hidden md:block absolute bottom-12 right-12 z-50"
                    >
                        <button
                            onClick={() => setShowAdd(true)}
                            className="w-16 h-16 bg-[#abb4d9] text-[#11111b] rounded-full shadow-2xl shadow-[#abb4d9]/40 flex items-center justify-center hover:scale-110 transition-transform"
                        >
                            <Plus size={32} strokeWidth={3} />
                        </button>
                    </motion.div>

                </>
            )}

            <BottomSheet isOpen={showAdd} onClose={() => { setShowAdd(false); setEditingExpense(null); }}>
                <AddExpenseFlow
                    members={selectedGroup?.members || []}
                    onClose={() => { setShowAdd(false); setEditingExpense(null); }}
                    onComplete={handleAddExpense}
                    initialExpense={editingExpense}
                />
            </BottomSheet>

            <BottomSheet isOpen={showCreateGroup} onClose={() => setShowCreateGroup(false)}>
                <CreateGroupFlow
                    onClose={() => setShowCreateGroup(false)}
                    onComplete={handleCreateGroup}
                />
            </BottomSheet>

            <BottomSheet isOpen={showEditGroup} onClose={() => setShowEditGroup(false)}>
                <EditGroupFlow
                    group={selectedGroup}
                    onClose={() => setShowEditGroup(false)}
                    onUpdate={handleUpdateGroup}
                    onDelete={handleDeleteGroup}
                />
            </BottomSheet>

            <BottomSheet isOpen={showAuth} onClose={() => setShowAuth(false)}>
                <AuthFlow onComplete={() => setShowAuth(false)} />
            </BottomSheet>

            {inviteGroupId && (
                <JoinGroupOverlay
                    groupId={inviteGroupId}
                    onClose={() => setInviteGroupId(null)}
                    onJoinSuccess={navigateToGroup}
                    onShowAuth={() => setShowAuth(true)}
                />
            )}

            <SystemAlerts />
        </div>
    );
}
