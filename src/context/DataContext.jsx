
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children, currentUser }) => {
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Fetch
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            const { data: tasksData, error: taskError } = await supabase.from('tasks').select('*');
            if (tasksData) setTasks(tasksData);
            if (taskError) console.error('Error fetching tasks:', taskError);

            const { data: projectsData, error: projError } = await supabase.from('projects').select('*');
            if (projectsData) setProjects(projectsData);

            const { data: eventsData, error: eventError } = await supabase.from('events').select('*');
            if (eventsData) setEvents(eventsData);

            setLoading(false);
        };

        fetchData();

        // Realtime Subscription
        const taskSubscription = supabase
            .channel('public:tasks')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setTasks(prev => [...prev, payload.new]);
                } else if (payload.eventType === 'UPDATE') {
                    setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
                } else if (payload.eventType === 'DELETE') {
                    setTasks(prev => prev.filter(t => t.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(taskSubscription);
        };
    }, []);

    // --- Actions (Supabase) ---

    // Tasks
    const addTask = async (task) => {
        // Optimistic update (optional, but skipping for simplicity first)
        // Only need to send data excluding ID/created_at which DB handles, 
        // OR we can generate ID here if we want optimistic UI. 
        // Let's rely on Realtime for now to keep it simple, or manual state update + DB call.

        // Manual state update for instant feedback
        // const tempId = Math.random().toString();
        // setTasks(prev => [...prev, { ...task, id: tempId, status: 'pending' }]); 

        const { data, error } = await supabase.from('tasks').insert([{
            ...task,
            status: 'pending',
            created_at: new Date().toISOString()
        }]).select();

        if (error) {
            console.error('Error adding task:', error);
            alert('Error saving task. Check console.');
        }
    };

    const updateTask = async (id, updates) => {
        // Optimistic UI
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

        const { error } = await supabase.from('tasks').update(updates).eq('id', id);
        if (error) console.error('Error updating task:', error);
    };

    const deleteTask = async (id) => {
        setTasks(prev => prev.filter(t => t.id !== id));
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) console.error('Error deleting task:', error);
    };

    // Projects (Simplified for MVP, usually similar structure)
    const addProject = async (project) => {
        const { error } = await supabase.from('projects').insert([project]);
        if (!error) {
            // Re-fetch or manual update? Realtime is best.
            // For now assume manual fetch or just let realtime handle it if we add subscription.
            // Adding manual state update for now:
            // setProjects... (need full object including generated ID, skipping for speed)
        }
    };

    const updateProject = async (id, updates) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        await supabase.from('projects').update(updates).eq('id', id);
    };

    const deleteProject = async (id) => {
        setProjects(prev => prev.filter(p => p.id !== id));
        await supabase.from('projects').delete().eq('id', id);
    };

    // Events
    const addEvent = async (event) => {
        const { error } = await supabase.from('events').insert([event]);
    };

    return (
        <DataContext.Provider value={{
            projects,
            tasks,
            events,
            loading,
            addTask,
            updateTask,
            deleteTask,
            addProject,
            updateProject,
            deleteProject,
            addEvent,
            currentUser
        }}>
            {children}
        </DataContext.Provider>
    );
};
