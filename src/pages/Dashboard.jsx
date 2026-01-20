
import React from 'react';
import { useData } from '../context/DataContext';
import { ArrowUpRight, Clock, CheckCircle2, AlertCircle, Euro } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
    const { tasks, projects, loading } = useData();

    if (loading) {
        return <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Sincronizando con el cuartel general...</div>;
    }

    // Stats Logic
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const highPriorityTasks = pendingTasks.filter(t => t.priority === 'high');
    const activeProjects = projects.filter(p => p.status === 'active');
    const completionRate = tasks.length > 0
        ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
        : 0;

    // Financial Logic
    const totalMonthlyRevenue = projects.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
    const totalAnnualRevenue = totalMonthlyRevenue * 12;

    const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <header style={{ marginBottom: 'var(--space-8)' }}>
                <p className="text-label" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{today}</p>
                <h1 className="text-h1" style={{ marginTop: 'var(--space-2)' }}>
                    Buenos días, <span style={{ color: 'var(--color-text-secondary)' }}>Creador.</span>
                </h1>
            </header>

            {/* KPI Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 'var(--space-6)',
                marginBottom: 'var(--space-12)'
            }}>

                <StatsCard
                    label="Tareas Prioritarias"
                    value={highPriorityTasks.length}
                    icon={AlertCircle}
                    color="var(--color-warning)"
                />
                <StatsCard
                    label="Proyectos Activos"
                    value={activeProjects.length}
                    icon={ArrowUpRight}
                    color="var(--color-accent)"
                />
                <StatsCard
                    label="Ratio Completado"
                    value={`${completionRate}%`}
                    icon={CheckCircle2}
                    color="var(--color-success)"
                />
            </div>

            {/* Main Content Areas */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-8)' }}>

                {/* Left Col: Projects & Focus */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

                    <section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                            <h2 className="text-h3">Foco del Día</h2>
                            <button className="btn btn-ghost">Ver todo</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {highPriorityTasks.length === 0 && (
                                <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                    <p>¡Todo despejado! No hay tareas urgentes.</p>
                                </div>
                            )}
                            {highPriorityTasks.slice(0, 3).map(task => (
                                <div key={task.id} className="card" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderLeft: '4px solid var(--color-warning)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                        <button className="btn-ghost" style={{ borderRadius: '50%', padding: '4px' }}>
                                            <div style={{ width: '18px', height: '18px', border: '2px solid var(--color-text-secondary)', borderRadius: '50%' }} />
                                        </button>
                                        <span style={{ fontWeight: '500' }}>{task.title}</span>
                                    </div>
                                    <span className="text-label" style={{ fontSize: '12px' }}>HOY</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-h3" style={{ marginBottom: 'var(--space-4)' }}>Proyectos en Curso</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                            {activeProjects.map(project => (
                                <div key={project.id} className="card" style={{ cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                                        <span style={{
                                            fontSize: '10px',
                                            textTransform: 'uppercase',
                                            fontWeight: '700',
                                            color: project.color || 'var(--color-accent)',
                                            border: `1px solid ${project.color || 'var(--color-accent)'}`,
                                            padding: '2px 6px',
                                            borderRadius: '4px'
                                        }}>
                                            ACTIVO
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: 'var(--size-lg)', fontWeight: '600', marginBottom: 'var(--space-2)' }}>{project.title}</h3>
                                    <p className="text-label">{project.description}</p>

                                    <div style={{ marginTop: 'var(--space-6)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Progreso</span>
                                            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{project.progress}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '4px', background: 'var(--color-bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${project.progress}%`, background: project.color || 'var(--color-accent)' }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>

                {/* Right Col: Quick Agenda & Finances */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

                    {/* Financial Overview Card */}
                    <div className="card" style={{ background: 'linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(37, 99, 235, 0.1) 100%)', border: '1px solid var(--color-accent-soft)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-6)' }}>
                            <div style={{ padding: '8px', borderRadius: '50%', background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>
                                <Euro size={20} />
                            </div>
                            <h2 className="text-h3">Resumen Financiero</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                            <div>
                                <p className="text-label" style={{ marginBottom: '4px' }}>Generado Mensual</p>
                                <p style={{ fontSize: '28px', fontWeight: '800', lineHeight: 1, letterSpacing: '-0.02em' }}>
                                    {totalMonthlyRevenue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                </p>
                            </div>

                            <div style={{ width: '100%', height: '1px', background: 'var(--border-subtle)' }}></div>

                            <div>
                                <p className="text-label" style={{ marginBottom: '4px' }}>Proyección Anual</p>
                                <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-success)' }}>
                                    {totalAnnualRevenue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ flex: 1 }}>
                        <h2 className="text-h3" style={{ marginBottom: 'var(--space-6)' }}>Agenda</h2>
                        {/* Visual Time Block */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontWeight: '600' }}>10:00</span>
                                    <div style={{ width: '1px', flex: 1, background: 'var(--border-subtle)' }} />
                                </div>
                                <div style={{
                                    flex: 1,
                                    background: 'var(--color-accent-dim)',
                                    borderLeft: '4px solid var(--color-accent)',
                                    padding: 'var(--space-3)',
                                    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
                                }}>
                                    <p style={{ fontWeight: '500', color: 'var(--color-accent)' }}>Revisión Semanal</p>
                                    <p className="text-label">Estrategia de Producto</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontWeight: '600', color: 'var(--color-text-secondary)' }}>12:30</span>
                                    <div style={{ width: '1px', flex: 1, background: 'var(--border-subtle)' }} />
                                </div>
                                <div style={{ padding: 'var(--space-2) 0' }}>
                                    <p style={{ color: 'var(--color-text-secondary)' }}>Almuerzo</p>
                                </div>
                            </div>
                        </div>

                        <button className="btn btn-ghost" style={{ width: '100%', marginTop: 'var(--space-6)' }}>
                            Ver Agenda Completa →
                        </button>
                    </div>
                </aside>

            </div>
        </div>
    );
};

const StatsCard = ({ label, value, icon: Icon, color }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--color-bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color
        }}>
            <Icon size={24} />
        </div>
        <div>
            <p style={{ fontSize: '28px', fontWeight: '700', lineHeight: 1 }}>{value}</p>
            <p className="text-label" style={{ marginTop: '2px' }}>{label}</p>
        </div>
    </div>
);

export default Dashboard;
