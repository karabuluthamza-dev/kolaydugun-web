import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const PlanningContext = createContext();

export const PlanningProvider = ({ children }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    // State
    const [weddingDetails, setWeddingDetails] = useState({
        weddingDate: '',
        totalBudget: 0,
        partnerName: ''
    });
    const [tasks, setTasks] = useState([]);
    const [budgetItems, setBudgetItems] = useState([]);
    const [guests, setGuests] = useState([]);
    const [tables, setTables] = useState([]);

    // Fetch all planning data
    useEffect(() => {
        if (user) {
            fetchPlanningData();
        } else {
            setLoading(false);
            // Reset state on logout
            setTasks([]);
            setBudgetItems([]);
            setGuests([]);
            setTables([]);
            setWeddingDetails({ weddingDate: '', totalBudget: 0, partnerName: '' });
        }
    }, [user]);

    const fetchPlanningData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Wedding Details
            const { data: details, error: detailsError } = await supabase
                .from('wedding_details')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (detailsError) console.error('Error fetching details:', detailsError);

            if (details) {
                setWeddingDetails({
                    weddingDate: details.wedding_date || '',
                    totalBudget: details.total_budget || 0,
                    partnerName: details.partner_name || ''
                });
            }

            // 2. Fetch Tasks
            const { data: tasksData } = await supabase
                .from('todos')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            setTasks(tasksData || []);

            // 3. Fetch Budget Items
            const { data: budgetData } = await supabase
                .from('budget_items')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            setBudgetItems(budgetData || []);

            // 4. Fetch Guests
            const { data: guestsData } = await supabase
                .from('guests')
                .select('*')
                .eq('user_id', user.id);
            setGuests(guestsData || []);

            // 5. Fetch Tables
            const { data: tablesData } = await supabase
                .from('seating_tables')
                .select('*')
                .eq('user_id', user.id);
            setTables(tablesData || []);

        } catch (error) {
            console.error('Error fetching planning data:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Wedding Details ---
    const setWeddingDate = async (date) => {
        try {
            const { error } = await supabase
                .from('wedding_details')
                .upsert({
                    user_id: user.id,
                    wedding_date: date
                }, { onConflict: 'user_id' });

            if (error) throw error;
            setWeddingDetails(prev => ({ ...prev, weddingDate: date }));
        } catch (error) {
            console.error('Error updating wedding date:', error);
        }
    };

    const setBudget = async (amount) => {
        try {
            const { error } = await supabase
                .from('wedding_details')
                .upsert({
                    user_id: user.id,
                    total_budget: amount
                }, { onConflict: 'user_id' });

            if (error) throw error;
            setWeddingDetails(prev => ({ ...prev, totalBudget: amount }));
        } catch (error) {
            console.error('Error updating budget:', error);
        }
    };

    // --- Tasks ---
    const addTask = async (task) => {
        try {
            const newTask = {
                user_id: user.id,
                title: task.title,
                category: task.category,
                month: task.month,
                is_completed: task.completed || false,
                notes: task.notes || ''
            };

            const { data, error } = await supabase
                .from('todos')
                .insert([newTask])
                .select()
                .single();

            if (error) throw error;
            setTasks(prev => [data, ...prev]);
            return data;
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const updateTask = async (taskId, updates) => {
        try {
            // Map frontend 'completed' to backend 'is_completed' if present
            const dbUpdates = { ...updates };
            if (updates.hasOwnProperty('completed')) {
                dbUpdates.is_completed = updates.completed;
                delete dbUpdates.completed;
            }

            const { data, error } = await supabase
                .from('todos')
                .update(dbUpdates)
                .eq('id', taskId)
                .select()
                .single();

            if (error) throw error;
            setTasks(prev => prev.map(t => t.id === taskId ? data : t));
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const removeTask = async (taskId) => {
        try {
            const { error } = await supabase
                .from('todos')
                .delete()
                .eq('id', taskId);

            if (error) throw error;
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    // --- Budget Items ---
    const addBudgetItem = async (item) => {
        try {
            const newItem = {
                user_id: user.id,
                category: item.category,
                estimated_cost: item.estimated,
                actual_cost: item.actual || 0,
                paid_amount: 0,
                notes: item.notes || ''
            };

            const { data, error } = await supabase
                .from('budget_items')
                .insert([newItem])
                .select()
                .single();

            if (error) throw error;
            setBudgetItems(prev => [data, ...prev]);
        } catch (error) {
            console.error('Error adding budget item:', error);
        }
    };

    const updateBudgetItem = async (itemId, updates) => {
        try {
            // Map frontend keys to DB keys
            const dbUpdates = {};
            if (updates.actual !== undefined) dbUpdates.actual_cost = updates.actual;
            if (updates.estimated !== undefined) dbUpdates.estimated_cost = updates.estimated;
            if (updates.paid !== undefined) dbUpdates.paid_amount = updates.paid;
            if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

            const { data, error } = await supabase
                .from('budget_items')
                .update(dbUpdates)
                .eq('id', itemId)
                .select()
                .single();

            if (error) throw error;
            setBudgetItems(prev => prev.map(i => i.id === itemId ? data : i));
        } catch (error) {
            console.error('Error updating budget item:', error);
        }
    };

    const removeBudgetItem = async (itemId) => {
        try {
            const { error } = await supabase
                .from('budget_items')
                .delete()
                .eq('id', itemId);

            if (error) throw error;
            setBudgetItems(prev => prev.filter(i => i.id !== itemId));
        } catch (error) {
            console.error('Error deleting budget item:', error);
        }
    };

    // --- Guests ---
    const addGuest = async (guest) => {
        try {
            const newGuest = {
                user_id: user.id,
                name: guest.name,
                status: 'pending',
                dietary_restrictions: ''
            };

            const { data, error } = await supabase
                .from('guests')
                .insert([newGuest])
                .select()
                .single();

            if (error) throw error;
            setGuests(prev => [...prev, data]);
        } catch (error) {
            console.error('Error adding guest:', error);
        }
    };

    const updateGuest = async (guestId, updates) => {
        try {
            const { data, error } = await supabase
                .from('guests')
                .update(updates)
                .eq('id', guestId)
                .select()
                .single();

            if (error) throw error;
            setGuests(prev => prev.map(g => g.id === guestId ? data : g));
        } catch (error) {
            console.error('Error updating guest:', error);
        }
    };

    const removeGuest = async (guestId) => {
        try {
            const { error } = await supabase
                .from('guests')
                .delete()
                .eq('id', guestId);

            if (error) throw error;
            setGuests(prev => prev.filter(g => g.id !== guestId));
        } catch (error) {
            console.error('Error deleting guest:', error);
        }
    };

    // --- Tables ---
    const addTable = async (table) => {
        console.error('ERROR LOG: Context addTable called with:', table);
        try {
            const newTable = {
                user_id: user.id,
                name: table.name,
                type: table.type,
                capacity: table.capacity,
                x: table.x,
                y: table.y
            };

            const { data, error } = await supabase
                .from('seating_tables')
                .insert([newTable])
                .select()
                .single();

            if (error) {
                console.error('Supabase error adding table:', error);
                throw error;
            }

            console.log('Table added successfully:', data);
            setTables(prev => [...prev, data]);
        } catch (error) {
            console.error('Error adding table:', error);
        }
    };

    const updateTable = async (tableId, updates) => {
        try {
            const { data, error } = await supabase
                .from('seating_tables')
                .update(updates)
                .eq('id', tableId)
                .select()
                .single();

            if (error) throw error;
            setTables(prev => prev.map(t => t.id === tableId ? data : t));
        } catch (error) {
            console.error('Error updating table:', error);
        }
    };

    const removeTable = async (tableId) => {
        try {
            const { error } = await supabase
                .from('seating_tables')
                .delete()
                .eq('id', tableId);

            if (error) throw error;
            setTables(prev => prev.filter(t => t.id !== tableId));
            // Update local guests state to remove table assignment
            setGuests(prev => prev.map(g => g.table_id === tableId ? { ...g, table_id: null } : g));
        } catch (error) {
            console.error('Error deleting table:', error);
        }
    };

    const assignGuestToTable = async (guestId, tableId) => {
        try {
            const { data, error } = await supabase
                .from('guests')
                .update({ table_id: tableId })
                .eq('id', guestId)
                .select()
                .single();

            if (error) throw error;
            setGuests(prev => prev.map(g => g.id === guestId ? data : g));
        } catch (error) {
            console.error('Error assigning guest to table:', error);
        }
    };

    return (
        <PlanningContext.Provider value={{
            loading,
            // Wedding Details
            weddingDate: weddingDetails.weddingDate,
            setWeddingDate,
            budget: weddingDetails.totalBudget,
            setBudget,

            // Tasks
            tasks: tasks.map(t => ({
                ...t,
                completed: t.is_completed // Map back for frontend
            })),
            addTask,
            updateTask,
            removeTask,

            // Budget Items
            budgetItems: budgetItems.map(i => ({
                ...i,
                estimated: i.estimated_cost, // Map back
                actual: i.actual_cost,
                paid: i.paid_amount
            })),
            addBudgetItem,
            updateBudgetItem,
            removeBudgetItem,

            // Guests & Tables
            guests: guests.map(g => ({
                ...g,
                tableId: g.table_id // Map back for frontend
            })),
            tables,
            addGuest,
            removeGuest,
            updateGuest,
            addTable,
            updateTable,
            removeTable,
            assignGuestToTable,
            refreshData: fetchPlanningData
        }}>
            {children}
        </PlanningContext.Provider>
    );
};

export const usePlanning = () => {
    const context = useContext(PlanningContext);
    if (!context) {
        throw new Error('usePlanning must be used within a PlanningProvider');
    }
    return context;
};
