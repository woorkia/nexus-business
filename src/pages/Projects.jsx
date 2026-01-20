
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Modal from '../components/UI/Modal';
import { Plus, Folder, MoreVertical, CheckCircle, Clock } from 'lucide-react';

const Projects = () => {
    const { projects, tasks, addProject } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', description: '', color: '#2563EB', status: 'active', revenue: 0 }); // Default blue

    const getProgress = (projectId) => {
        const projectTasks = tasks.filter(t => t.projectId === projectId);
        if (projectTasks.length === 0) return 0;
        const completed = projectTasks.filter(t => t.status === 'completed').length;
        return Math.round((completed / projectTasks.length) * 100);
    };

    const handleAddProject = (e) => {
        e.preventDefault();
        if (!newProject.title) return;
        addProject(newProject);
        setNewProject({ title: '', description: '', color: '#2563EB', status: 'active', revenue: 0 });
        setIsModalOpen(false);
    };

    // Filter Projects
    const activeProjects = projects.filter(p => p.status === 'active');
    const pendingProjects = projects.filter(p => p.status !== 'active'); // Pending, completed, archived

    const ProjectCard = ({ project }) => {
        const progress = getProgress(project.id);
        return (
            <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                    {/* Status Indicator Line */}
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: project.color }}></div>

                    <div style={{ paddingLeft: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                            {project.logo ? (
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', background: 'var(--color-bg-tertiary)', flexShrink: 0, border: '1px solid var(--border-subtle)' }}>
                                    <img src={project.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ) : (
                                <div style={{
                                    padding: '10px',
                                    borderRadius: '12px',
                                    background: 'var(--color-bg-tertiary)',
                                    color: project.color
                                }}>
                                    <Folder size={24} />
                                </div>
                            )}
                            <div>
                                <h2 className="text-h3" style={{ fontSize: 'var(--size-lg)' }}>{project.title}</h2>
                                <span className="text-label" style={{ fontSize: '10px' }}>
                                    {project.status === 'active' ? 'EN CURSO' : 'PENDIENTE'}
                                </span>
                            </div>
                        </div>

                        <p className="text-label" style={{ flex: 1, marginBottom: 'var(--space-6)', minHeight: '40px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {project.description || 'Sin descripción'}
                        </p>

                        <div style={{ marginTop: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '10px', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                                <span>Progreso</span>
                                <span>{progress}%</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'var(--color-bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: project.color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
                <div>
                    <h1 className="text-h1">Proyectos</h1>
                    <p className="text-label">Gestión general</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Nuevo Proyecto
                </button>
            </div>

            {/* Active Projects Section */}
            <div style={{ marginBottom: 'var(--space-12)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-6)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }}></div>
                    <h2 className="text-h2" style={{ fontSize: '18px' }}>Activos</h2>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', background: 'var(--color-bg-tertiary)', padding: '2px 8px', borderRadius: '12px' }}>
                        {activeProjects.length}
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
                    {activeProjects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                    {activeProjects.length === 0 && (
                        <div style={{ padding: '40px', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                            <p>No tienes proyectos activos.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pending/Other Projects Section */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-6)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-text-secondary)' }}></div>
                    <h2 className="text-h2" style={{ fontSize: '18px', color: 'var(--color-text-secondary)' }}>Pendientes / Historial</h2>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', background: 'var(--color-bg-tertiary)', padding: '2px 8px', borderRadius: '12px' }}>
                        {pendingProjects.length}
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
                    {pendingProjects.map(project => (
                        <div key={project.id} style={{ opacity: 0.7 }}>
                            <ProjectCard project={project} />
                        </div>
                    ))}
                    {pendingProjects.length === 0 && (
                        <p className="text-label" style={{ paddingLeft: '8px' }}>No hay proyectos pendientes.</p>
                    )}
                </div>
            </div>

            {/* Add Project Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Proyecto">
                <form onSubmit={handleAddProject} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                        <label className="text-label">Nombre del Proyecto</label>
                        <input
                            type="text"
                            value={newProject.title}
                            onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                            autoFocus
                            style={{
                                width: '100%', padding: '12px', marginTop: '5px',
                                background: 'var(--color-bg-tertiary)', border: '1px solid transparent', borderRadius: 'var(--radius-lg)', color: 'white'
                            }}
                        />
                    </div>
                    <div>
                        <label className="text-label">Descripción Breve</label>
                        <textarea
                            value={newProject.description}
                            onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                            style={{
                                width: '100%', padding: '12px', marginTop: '5px',
                                background: 'var(--color-bg-tertiary)', border: '1px solid transparent', borderRadius: 'var(--radius-lg)', color: 'white',
                                resize: 'none', height: '100px'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div>
                            <label className="text-label">Estado</label>
                            <div style={{ display: 'flex', gap: '4px', marginTop: '5px' }}>
                                <button
                                    type="button"
                                    onClick={() => setNewProject({ ...newProject, status: 'active' })}
                                    style={{
                                        flex: 1, padding: '10px',
                                        background: newProject.status === 'active' ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-pill)',
                                        border: '1px solid transparent',
                                        color: newProject.status === 'active' ? 'white' : 'var(--color-text-secondary)',
                                        fontWeight: '600', fontSize: '11px'
                                    }}
                                >
                                    ACTIVO
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewProject({ ...newProject, status: 'pending' })}
                                    style={{
                                        flex: 1, padding: '10px',
                                        background: newProject.status === 'pending' ? 'var(--color-text-secondary)' : 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-pill)',
                                        border: '1px solid transparent',
                                        color: newProject.status === 'pending' ? 'white' : 'var(--color-text-secondary)',
                                        fontWeight: '600', fontSize: '11px'
                                    }}
                                >
                                    PENDIENTE
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-label">Ingreso Mensual</label>
                            <div style={{ position: 'relative', marginTop: '5px' }}>
                                <input
                                    type="number"
                                    value={newProject.revenue || ''}
                                    onChange={e => setNewProject({ ...newProject, revenue: Number(e.target.value) })}
                                    placeholder="0"
                                    style={{
                                        width: '100%', padding: '10px 10px 10px 30px',
                                        background: 'var(--color-bg-tertiary)', border: '1px solid transparent', borderRadius: 'var(--radius-lg)', color: 'white'
                                    }}
                                />
                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }}>€</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-label">Color del Proyecto</label>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                            {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(c => (
                                <div
                                    key={c}
                                    onClick={() => setNewProject({ ...newProject, color: c })}
                                    style={{
                                        width: '32px', height: '32px', borderRadius: '50%', background: c, cursor: 'pointer',
                                        border: newProject.color === c ? '2px solid white' : '2px solid transparent',
                                        boxShadow: newProject.color === c ? `0 0 10px ${c}` : 'none'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>Crear Proyecto</button>
                </form>
            </Modal>
        </div>
    );
};

export default Projects;
