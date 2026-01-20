
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/UI/Modal';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale'; // Spanish locale
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';

const Agenda = () => {
    const { events, addEvent, tasks } = useData();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Event State
    const [newEvent, setNewEvent] = useState({ title: '', date: format(new Date(), 'yyyy-MM-dd'), time: '09:00', type: 'meeting' });

    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    const handlePreviousWeek = () => setCurrentDate(addDays(currentDate, -7));
    const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));

    const handleAddEvent = (e) => {
        e.preventDefault();
        if (!newEvent.title) return;
        addEvent(newEvent);
        setNewEvent({ title: '', date: format(new Date(), 'yyyy-MM-dd'), time: '09:00', type: 'meeting' });
        setIsModalOpen(false);
    };

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <h1 className="text-h1">Agenda</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
                        <button onClick={handlePreviousWeek} className="btn-ghost" style={{ padding: '4px' }}><ChevronLeft size={20} /></button>
                        <span style={{ fontWeight: '600', minWidth: '140px', textAlign: 'center' }}>
                            {format(startDate, 'MMMM yyyy', { locale: es })}
                        </span>
                        <button onClick={handleNextWeek} className="btn-ghost" style={{ padding: '4px' }}><ChevronRight size={20} /></button>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                        href="https://calendar.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-subtle)' }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 4H6C4.89543 4 4 4.89543 4 6V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V6C20 4.89543 19.1046 4 18 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M4 10H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Google Calendar
                    </a>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Nuevo Evento
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            {/* Calendar Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 'var(--space-4)',
                flex: 1,
                overflow: 'hidden'
            }}>
                {weekDays.map((day, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Day Header */}
                        <div style={{
                            textAlign: 'center',
                            marginBottom: 'var(--space-4)',
                            padding: 'var(--space-2)',
                            background: isSameDay(day, new Date()) ? 'var(--color-accent)' : 'transparent',
                            borderRadius: 'var(--radius-lg)',
                            color: isSameDay(day, new Date()) ? 'white' : 'var(--color-text-secondary)',
                            border: isSameDay(day, new Date()) ? 'none' : '1px solid transparent'
                        }}>
                            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                                {format(day, 'EEE', { locale: es })}
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: '700', marginTop: '4px' }}>
                                {format(day, 'd')}
                            </div>
                        </div>

                        {/* Day Column */}
                        <div style={{
                            flex: 1,
                            padding: 'var(--space-2)',
                            background: 'var(--color-bg-secondary)',
                            borderRadius: 'var(--radius-xl)',
                            overflowY: 'auto',
                            border: '1px solid var(--border-subtle)'
                        }}>
                            {/* Merged Events & Tasks */}
                            {(
                                [
                                    ...events.filter(e => isSameDay(parseISO(e.date), day)).map(e => ({ ...e, source: 'event' })),
                                    ...tasks.filter(t => t.dueDate && isSameDay(parseISO(t.dueDate), day)).map(t => ({
                                        id: t.id,
                                        title: t.title,
                                        time: format(parseISO(t.dueDate), 'HH:mm'),
                                        type: 'task',
                                        priority: t.priority,
                                        source: 'task',
                                        status: t.status
                                    }))
                                ].sort((a, b) => a.time.localeCompare(b.time))
                            ).map(item => (
                                <div key={item.id} style={{
                                    marginBottom: 'var(--space-2)',
                                    padding: '12px',
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--color-bg-primary)',
                                    border: '1px solid var(--border-subtle)',
                                    borderLeft: `4px solid ${item.source === 'task' ? (item.status === 'completed' ? 'var(--color-success)' : 'var(--color-text-secondary)') : (item.type === 'meeting' ? 'var(--color-accent)' : 'var(--color-warning)')}`,
                                    opacity: item.status === 'completed' ? 0.6 : 1,
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontWeight: 600 }}>
                                        <Clock size={10} /> {item.time} {item.source === 'task' && '(Tarea)'}
                                    </div>
                                    <div style={{ fontSize: '13px', fontWeight: '500', lineHeight: '1.3', textDecoration: item.status === 'completed' ? 'line-through' : 'none' }}>
                                        {item.title}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Event Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Evento">
                <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                        <label className="text-label">Título</label>
                        <input
                            value={newEvent.title}
                            onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                            autoFocus
                            style={{ width: '100%', padding: '10px', marginTop: '4px', background: 'var(--color-bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label className="text-label">Fecha</label>
                            <input
                                type="date"
                                value={newEvent.date}
                                onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                style={{ width: '100%', padding: '10px', marginTop: '4px', background: 'var(--color-bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="text-label">Hora</label>
                            <input
                                type="time"
                                value={newEvent.time}
                                onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                                style={{ width: '100%', padding: '10px', marginTop: '4px', background: 'var(--color-bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-label">Tipo</label>
                        <select
                            value={newEvent.type}
                            onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                            style={{ width: '100%', padding: '10px', marginTop: '4px', background: 'var(--color-bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
                        >
                            <option value="meeting">Reunión</option>
                            <option value="work">Bloque de Trabajo</option>
                            <option value="reminder">Recordatorio</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>Agendar</button>
                </form>
            </Modal>
        </div>
    );
};

export default Agenda;
