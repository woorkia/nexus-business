
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/UI/Modal';
import { Plus, Filter, Calendar as CalIcon, Flag, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';

const Tasks = () => {
    const { tasks, addTask, updateTask, deleteTask, currentUser, loading } = useData(); // Get currentUser and loading
    const [filter, setFilter] = useState('all'); // all, active, completed
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (loading) {
        return <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Cargando tareas...</div>;
    }

    // New Task State
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('medium');
    const [newTaskAssignee, setNewTaskAssignee] = useState(currentUser?.id || 'samuel'); // Default to logged in user
    const [newTaskDay, setNewTaskDay] = useState('monday'); // Default to Monday
    const [newTaskTime, setNewTaskTime] = useState(''); // Default empty

    const filteredTasks = tasks.filter(task => {
        if (filter === 'active') return task.status !== 'completed';
        if (filter === 'completed') return task.status === 'completed';
        return true;
    });

    // Sort: Pending first, then by priority. For completed, sort by completion date desc.
    const getSortedTasks = (taskList) => {
        return [...taskList].sort((a, b) => {
            if (a.status === 'completed' && b.status === 'completed') {
                // If both completed, sort by completedAt desc (newest first)
                const dateA = a.completedAt ? new Date(a.completedAt) : new Date(0);
                const dateB = b.completedAt ? new Date(b.completedAt) : new Date(0);
                return dateB - dateA;
            }
            if (a.status === b.status) {
                const priorities = { high: 3, medium: 2, low: 1 };
                return priorities[b.priority] - priorities[a.priority];
            }
            return a.status === 'completed' ? 1 : -1;
        });
    };

    const samuelTasks = getSortedTasks(filteredTasks.filter(t => t.assignee === 'samuel'));
    const sergiTasks = getSortedTasks(filteredTasks.filter(t => t.assignee === 'sergi'));
    const unassignedTasks = getSortedTasks(filteredTasks.filter(t => t.assignee !== 'samuel' && t.assignee !== 'sergi'));

    const getWeekDate = (dayName, timeString) => {
        const today = new Date();
        const currentDay = today.getDay(); // 0=Sun, 1=Mon, etc.
        const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

        const mondayDate = new Date(today);
        mondayDate.setDate(today.getDate() + diffToMonday);

        const offsets = {
            'monday': 0, 'tuesday': 1, 'wednesday': 2, 'thursday': 3, 'friday': 4, 'weekend': 5, 'unplanned': 0
        };

        const targetDate = new Date(mondayDate);
        targetDate.setDate(mondayDate.getDate() + (offsets[dayName] || 0));

        if (timeString) {
            const [hours, minutes] = timeString.split(':');
            targetDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
            // Default to end of day? Or just create date. For Agenda sync, having a time is better if explicit.
            // If no time, Agenda usually shows it at 00:00 or general.
            // Let's keep current time or 09:00 if no time specified but day is specified? 
            // Actually, if unnecessary, just keep date as is.
            targetDate.setHours(12, 0, 0, 0); // Default to noon to avoid timezone shifts hitting previous day
        }

        return targetDate.toISOString();
    };

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        const computedDueDate = getWeekDate(newTaskDay, newTaskTime);

        addTask({
            title: newTaskTitle,
            priority: newTaskPriority,
            status: 'pending',
            dueDate: computedDueDate,
            assignee: newTaskAssignee,
            plannedDay: newTaskDay // New field: monday, tuesday, etc.
        });

        setNewTaskTitle('');
        setNewTaskPriority('medium');
        setNewTaskTime('');
        setNewTaskAssignee(currentUser?.id || 'samuel'); // Reset to current user
        setIsModalOpen(false);
    };

    const toggleStatus = (task) => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        const updates = { status: newStatus };
        if (newStatus === 'completed') {
            updates.completedAt = new Date().toISOString();
        } else {
            updates.completedAt = null;
        }
        updateTask(task.id, updates);
    };

    // New helper to group by planned day
    const groupTasksByDay = (taskList) => {
        if (filter === 'completed') {
            // Keep existing logic for completed tasks (Weekly History)
            const groups = {};
            taskList.forEach(task => {
                if (!task.completedAt) {
                    const key = 'Sin fecha';
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(task);
                    return;
                }
                const date = new Date(task.completedAt);
                const now = new Date();
                const diffTime = Math.abs(now - date);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                let key = 'Anteriores';
                if (date.toDateString() === now.toDateString()) key = 'Hoy';
                else if (diffDays <= 7) key = 'Esta Semana';
                else if (diffDays <= 14) key = 'Semana Pasada';
                if (!groups[key]) groups[key] = [];
                groups[key].push(task);
            });
            return { type: 'history', groups };
        }

        // For Active/All tasks: Group by Planned Day (Mon-Fri)
        const groups = {
            'monday': [], 'tuesday': [], 'wednesday': [], 'thursday': [], 'friday': [], 'weekend': [], 'unplanned': []
        };

        taskList.forEach(task => {
            const day = task.plannedDay || 'unplanned';
            if (groups[day]) groups[day].push(task);
            else groups['unplanned'].push(task);
        });

        return { type: 'daily', groups };
    };

    const dayLabels = {
        'monday': 'Lunes', 'tuesday': 'Martes', 'wednesday': 'Miércoles', 'thursday': 'Jueves', 'friday': 'Viernes', 'weekend': 'Finde', 'unplanned': 'Sin Planificar'
    };

    const TaskColumn = ({ tasks, title, color }) => {
        const { type, groups } = groupTasksByDay(tasks);

        let keysToRender;
        if (type === 'history') {
            keysToRender = ['Hoy', 'Esta Semana', 'Semana Pasada', 'Anteriores', 'Sin fecha'].filter(k => groups[k]);
        } else {
            keysToRender = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'weekend', 'unplanned'].filter(k => groups[k] && groups[k].length > 0);
        }

        return (
            <div>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)',
                    paddingBottom: '8px', borderBottom: `2px solid ${color}`
                }}>
                    <h2 className="text-h2" style={{ color: color }}>{title}</h2>
                    <span className="text-label" style={{ background: 'var(--color-bg-secondary)', padding: '2px 8px', borderRadius: '12px' }}>
                        {tasks.length}
                    </span>
                </div>
                <div>
                    {keysToRender.map(groupKey => (
                        <div key={groupKey} style={{ marginBottom: 'var(--space-4)' }}>
                            <h4 className="text-label" style={{
                                marginTop: '8px', marginBottom: '8px',
                                color: type === 'daily' ? 'white' : 'var(--color-text-secondary)',
                                background: type === 'daily' ? 'var(--color-bg-secondary)' : 'transparent',
                                padding: type === 'daily' ? '4px 8px' : '0',
                                borderRadius: '4px',
                                display: 'inline-block',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {type === 'history' ? groupKey : dayLabels[groupKey]}
                            </h4>
                            {groups[groupKey].map(task => <TaskCard key={task.id} task={task} />)}
                        </div>
                    ))}
                    {tasks.length === 0 && <p className="text-label" style={{ fontStyle: 'italic' }}>No hay tareas.</p>}
                </div>
            </div>
        );
    };

    const TaskCard = ({ task }) => (
        <div key={task.id} className="card" style={{
            display: 'flex',
            alignItems: 'center',
            padding: 'var(--space-3)',
            opacity: task.status === 'completed' ? 0.6 : 1,
            marginBottom: 'var(--space-2)',
            borderLeft: task.status !== 'completed' ? `4px solid ${task.priority === 'high' ? 'var(--color-danger)' :
                task.priority === 'medium' ? 'var(--color-warning)' : 'var(--color-success)'
                }` : '1px solid var(--border-subtle)',
            background: 'var(--color-bg-primary)'
        }}>
            <div
                onClick={() => toggleStatus(task)}
                style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: task.status === 'completed' ? 'none' : '2px solid var(--color-text-secondary)',
                    background: task.status === 'completed' ? 'var(--color-success)' : 'transparent',
                    marginRight: 'var(--space-3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}
            >
                {task.status === 'completed' && <Plus size={14} style={{ transform: 'rotate(45deg)', color: '#000' }} />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    marginBottom: '2px'
                }}>
                    {task.title}
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                    {task.priority === 'high' &&
                        <span className="text-label" style={{ fontSize: '9px', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', padding: '0 4px', borderRadius: 'var(--radius-pill)' }}>HIGH</span>
                    }
                    {task.dueDate && (
                        <span className="text-label" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--color-text-secondary)' }}>
                            <Clock size={10} /> {format(new Date(task.dueDate), 'HH:mm')}
                        </span>
                    )}
                </div>
            </div>

            <button
                className="btn-ghost"
                style={{ color: 'var(--color-danger)', padding: '4px' }}
                onClick={() => deleteTask(task.id)}
            >
                <Trash2 size={14} />
            </button>
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
                <h1 className="text-h1">Tareas</h1>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Nueva Tarea
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
                {['all', 'active', 'completed'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ textTransform: 'capitalize' }}
                    >
                        {f === 'all' ? 'Todas' : f === 'active' ? 'Pendientes' : 'Completadas'}
                    </button>
                ))}
            </div>

            {/* Unassigned Tasks (if any) */}
            {unassignedTasks.length > 0 && (
                <div style={{ marginBottom: 'var(--space-8)' }}>
                    <h3 className="text-h3" style={{ marginBottom: 'var(--space-4)', opacity: 0.7 }}>Sin Asignar</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                        {unassignedTasks.map(task => <TaskCard key={task.id} task={task} />)}
                    </div>
                </div>
            )}

            {/* Split View: Samuel vs Sergi */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)' }}>
                {/* Samuel's Column */}
                <TaskColumn tasks={samuelTasks} title="Samuel" color="var(--color-accent)" />

                {/* Sergi's Column */}
                <TaskColumn tasks={sergiTasks} title="Sergi" color="#10b981" />
            </div>

            {/* Add Task Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Tarea">
                <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                        <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>Título</label>
                        <input
                            autoFocus
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="¿Qué hay que hacer?"
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'var(--color-bg-primary)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-md)',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div>
                            <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>Asignar a</label>
                            <select
                                value={newTaskAssignee}
                                onChange={e => setNewTaskAssignee(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px',
                                    background: 'var(--color-bg-tertiary)', border: '1px solid transparent', borderRadius: 'var(--radius-md)', color: 'white'
                                }}
                            >
                                <option value="samuel">Samuel</option>
                                <option value="sergi">Sergi</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>Día Planificado</label>
                            <select
                                value={newTaskDay}
                                onChange={e => setNewTaskDay(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px',
                                    background: 'var(--color-bg-tertiary)', border: '1px solid transparent', borderRadius: 'var(--radius-md)', color: 'white'
                                }}
                            >
                                <option value="unplanned">Sin Planificar</option>
                                <option value="monday">Lunes</option>
                                <option value="tuesday">Martes</option>
                                <option value="wednesday">Miércoles</option>
                                <option value="thursday">Jueves</option>
                                <option value="friday">Viernes</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>Hora (Opcional)</label>
                        <input
                            type="time"
                            value={newTaskTime}
                            onChange={(e) => setNewTaskTime(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'var(--color-bg-primary)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-md)',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div>
                        <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>Prioridad</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['low', 'medium', 'high'].map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setNewTaskPriority(p)}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        background: newTaskPriority === p ? 'var(--color-bg-tertiary)' : 'transparent',
                                        border: `1px solid ${newTaskPriority === p ? 'var(--color-accent)' : 'var(--border-subtle)'}`,
                                        borderRadius: 'var(--radius-pill)',
                                        color: 'white',
                                        textTransform: 'capitalize',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">Cancelar</button>
                        <button type="submit" className="btn btn-primary">Crear Tarea</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Tasks;
