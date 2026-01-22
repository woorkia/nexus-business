
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
            if (tasksData) {
                // Map DB snake_case -> App camelCase
                const mappedTasks = tasksData.map(t => ({
                    ...t,
                    dueDate: t.due_date,
                    plannedDay: t.planned_day,
                    completedAt: t.completed_at,
                    projectId: t.project_id
                }));
                setTasks(mappedTasks);
            }
            if (taskError) console.error('Error fetching tasks:', taskError);

            const { data: projectsData, error: projError } = await supabase.from('projects').select('*');
            if (projectsData) setProjects(projectsData);

            const { data: eventsData, error: eventError } = await supabase.from('events').select('*');
            if (eventsData) setEvents(eventsData);

            setLoading(false);
        };

        fetchData();

        // Realtime Subscription (Tasks)
        const taskSubscription = supabase
            .channel('public:tasks')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    // Map new task
                    const newItem = {
                        ...payload.new,
                        dueDate: payload.new.due_date,
                        plannedDay: payload.new.planned_day,
                        completedAt: payload.new.completed_at
                    };
                    setTasks(prev => [...prev, newItem]);
                } else if (payload.eventType === 'UPDATE') {
                    setTasks(prev => prev.map(t => t.id === payload.new.id ? {
                        ...payload.new,
                        dueDate: payload.new.due_date,
                        plannedDay: payload.new.planned_day,
                        completedAt: payload.new.completed_at
                    } : t));
                } else if (payload.eventType === 'DELETE') {
                    setTasks(prev => prev.filter(t => t.id !== payload.old.id));
                }
            })
            .subscribe();

        // Realtime Subscription (Projects)
        const projectSubscription = supabase
            .channel('public:projects')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setProjects(prev => {
                        // Prevent duplicates
                        if (prev.some(p => p.id === payload.new.id)) return prev;
                        return [...prev, payload.new];
                    });
                } else if (payload.eventType === 'UPDATE') {
                    setProjects(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
                } else if (payload.eventType === 'DELETE') {
                    setProjects(prev => prev.filter(p => p.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(taskSubscription);
            supabase.removeChannel(projectSubscription);
        };
    }, []);

    // --- Actions (Supabase) ---

    // Tasks
    const addTask = async (task) => {
        // Map camelCase to snake_case for DB
        const dbTask = {
            title: task.title,
            priority: task.priority,
            status: 'pending',
            due_date: task.dueDate, // Map dueDate -> due_date
            assignee: task.assignee,
            planned_day: task.plannedDay, // Map plannedDay -> planned_day
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase.from('tasks').insert([dbTask]).select();

        if (error) {
            console.error('Error adding task:', error);
            alert('Error saving task. Check console.');
        }
    };

    const updateTask = async (id, updates) => {
        // Optimistic UI (keeping existing structure, but mapping for DB)
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

        // Map updates to snake_case
        const dbUpdates = {};
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt; // Map completedAt
        if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
        if (updates.assignee) dbUpdates.assignee = updates.assignee;
        if (updates.plannedDay) dbUpdates.planned_day = updates.plannedDay;

        const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
        if (error) console.error('Error updating task:', error);
    };

    const deleteTask = async (id) => {
        setTasks(prev => prev.filter(t => t.id !== id));
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) console.error('Error deleting task:', error);
    };

    // Projects
    const addProject = async (project) => {
        // Map camelCase to snake_case
        // EXCLUDING 'revenue' because the DB table doesn't have it yet.
        const { revenue, ...rest } = project;

        const dbProject = {
            ...rest,
            created_at: new Date().toISOString()
        };
        // If we have specific fields that need mapping, do it here.
        // Currently Projects seems to use simple fields (title, status, description, color).
        // If due_date is added later, we'd map it here.

        const { data, error } = await supabase.from('projects').insert([dbProject]).select();

        if (error) {
            console.error('Error adding project:', error);
            alert('Error adding project. Check console.');
        }
        // SUCCESS: Do nothing here. 
        // The Realtime Subscription (projectSubscription) in useEffect 
        // will automatically catch the INSERT event and update the state.
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
