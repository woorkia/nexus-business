
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowLeft, Plus, Trash2, CheckSquare, FileText, Link as LinkIcon, Image as ImageIcon, ExternalLink, UploadCloud, Download, Euro } from 'lucide-react';
import Modal from '../components/UI/Modal';
import { saveFile, getProjectFiles, deleteFile } from '../utils/db'; // Import DB utils

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { projects, updateProject, deleteProject, tasks, addTask, updateTask, deleteTask } = useData();

    const project = projects.find(p => p.id === id);
    const projectTasks = tasks.filter(t => t.projectId === id);

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);

    // Document State
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [newDoc, setNewDoc] = useState({ name: '', url: '', type: 'link' });

    // Files State (IndexedDB)
    const [localFiles, setLocalFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingContract, setIsDraggingContract] = useState(false);

    // Logo State
    const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');

    // Load files on mount
    useEffect(() => {
        if (id) {
            loadFiles();
        }
    }, [id]);

    const loadFiles = async () => {
        try {
            const files = await getProjectFiles(id);
            setLocalFiles(files);
        } catch (error) {
            console.error("Error loading files:", error);
        }
    };

    if (!project) return <div className="p-8">Proyecto no encontrado</div>;

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        addTask({
            title: newTaskTitle,
            priority: 'medium',
            status: 'pending',
            projectId: id,
            dueDate: new Date().toISOString()
        });
        setNewTaskTitle('');
    };

    const handleAddDoc = (e) => {
        e.preventDefault();
        if (!newDoc.name || !newDoc.url) return;

        const updatedDocs = [...(project.documents || []), { ...newDoc, id: Date.now() }];
        updateProject(id, { documents: updatedDocs });

        setNewDoc({ name: '', url: '', type: 'link' });
        setIsDocModalOpen(false);
    };

    const handleDeleteDoc = (docId) => {
        const updatedDocs = project.documents.filter(d => d.id !== docId);
        updateProject(id, { documents: updatedDocs });
    };

    // --- File Storage Logic ---
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        for (const file of files) {
            await saveFile(file, id);
        }
        loadFiles(); // Refresh list
    };

    const handleFileInput = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        for (const file of files) {
            await saveFile(file, id);
        }
        loadFiles();
    };

    const handleDeleteFile = async (fileId) => {
        if (window.confirm('¿Eliminar archivo permanentemente?')) {
            await deleteFile(fileId);
            loadFiles();
        }
    };

    const downloadFile = (fileData) => {
        const url = URL.createObjectURL(fileData.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileData.name;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleUpdateLogo = (e) => {
        e.preventDefault();
        updateProject(id, { logo: logoUrl });
        setIsLogoModalOpen(false);
    };

    const handleDelete = () => {
        if (window.confirm('¿Seguro que quieres eliminar este proyecto?')) {
            // Ideally we should also delete all files in DB associated with this project
            deleteProject(id);
            navigate('/projects');
        }
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ minHeight: '100vh', position: 'relative' }}
        >
            {/* Drag Overlay */}
            {isDragging && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(59, 130, 246, 0.2)', border: '4px dashed var(--color-accent)',
                    zIndex: 50, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <UploadCloud size={32} color="var(--color-accent)" />
                        <span className="text-h3">Suelta los archivos aquí</span>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: 'var(--space-8)' }}>
                <div style={{ display: 'flex', marginBottom: 'var(--space-6)' }}>
                    <button
                        onClick={() => navigate('/projects')}
                        className="btn-ghost"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 20px',
                            borderRadius: 'var(--radius-pill)',
                            background: 'var(--color-bg-tertiary)',
                            color: 'var(--color-text-primary)'
                        }}
                    >
                        <ArrowLeft size={16} /> <span style={{ fontSize: '13px', fontWeight: 600 }}>VOLVER A PROYECTOS</span>
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
                        {/* Logo */}
                        <div
                            onClick={() => { setLogoUrl(project.logo || ''); setIsLogoModalOpen(true); }}
                            style={{
                                width: '80px', height: '80px', borderRadius: 'var(--radius-lg)',
                                background: 'var(--color-bg-tertiary)', border: '1px solid var(--border-subtle)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden', cursor: 'pointer', position: 'relative'
                            }}
                        >
                            {project.logo ? (
                                <img src={project.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <ImageIcon size={32} color="var(--color-text-secondary)" />
                            )}
                        </div>

                        <div>
                            <span style={{ color: project.color, fontWeight: '600', textTransform: 'uppercase', fontSize: '12px' }}>PROYECTO</span>
                            <h1 className="text-h1" style={{ marginTop: '8px' }}>{project.title}</h1>
                            <p className="text-secondary" style={{ maxWidth: '600px', marginTop: '8px' }}>{project.description}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-ghost" style={{ color: 'var(--color-danger)' }} onClick={handleDelete}><Trash2 size={20} /></button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: 'var(--space-8)' }}>

                {/* Task List Section */}
                <section>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
                            <h3 className="text-h3">Tareas del Proyecto</h3>
                        </div>

                        <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '10px', marginBottom: 'var(--space-6)' }}>
                            <input
                                type="text"
                                placeholder="Añadir tarea al proyecto..."
                                value={newTaskTitle}
                                onChange={e => setNewTaskTitle(e.target.value)}
                                style={{
                                    flex: 1, padding: '10px',
                                    background: 'var(--color-bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white'
                                }}
                            />
                            <button type="submit" className="btn btn-primary"><Plus size={18} /></button>
                        </form>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {projectTasks.length === 0 && <p className="text-label" style={{ textAlign: 'center' }}>No hay tareas asociadas.</p>}
                            {projectTasks.map(task => (
                                <div key={task.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '12px', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)',
                                    borderLeft: task.status === 'completed' ? '4px solid var(--color-success)' : '4px solid var(--border-subtle)',
                                    opacity: task.status === 'completed' ? 0.6 : 1
                                }}>
                                    <div
                                        onClick={() => {
                                            const newStatus = task.status === 'completed' ? 'pending' : 'completed';
                                            updateTask(task.id, {
                                                status: newStatus,
                                                completedAt: newStatus === 'completed' ? new Date().toISOString() : null
                                            });
                                        }}
                                        style={{
                                            cursor: 'pointer', width: '20px', height: '20px', borderRadius: '4px', border: '2px solid var(--color-text-secondary)',
                                            background: task.status === 'completed' ? 'var(--color-success)' : 'transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                        {task.status === 'completed' && <CheckSquare size={14} style={{ color: 'black' }} />}
                                    </div>

                                    <span
                                        onClick={() => setSelectedTask(task)}
                                        style={{ flex: 1, textDecoration: task.status === 'completed' ? 'line-through' : 'none', cursor: 'pointer' }}
                                    >
                                        {task.title}
                                    </span>
                                    <button onClick={() => deleteTask(task.id)} className="btn-ghost" style={{ padding: '4px', color: 'var(--color-text-muted)' }}><Trash2 size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Sidebar Section: Docs & Notes */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

                    {/* Contract Card */}
                    <div
                        className="card"
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingContract(true); }}
                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingContract(false); }}
                        onDrop={async (e) => {
                            e.preventDefault(); e.stopPropagation();
                            setIsDraggingContract(false);
                            const files = Array.from(e.dataTransfer.files);
                            if (files.length === 0) return;
                            await saveFile(files[0], id, 'contract'); // Save as contract
                            loadFiles();
                        }}
                        style={{
                            background: isDraggingContract ? 'rgba(37, 99, 235, 0.1)' : 'var(--color-bg-secondary)',
                            border: isDraggingContract ? '2px dashed var(--color-accent)' : '1px solid var(--border-subtle)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <div style={{ padding: '8px', borderRadius: '50%', background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>
                                <FileText size={18} />
                            </div>
                            <h3 className="text-h3" style={{ fontSize: '16px' }}>Contrato del Cliente</h3>
                        </div>

                        {localFiles.find(f => f.category === 'contract') ? (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '12px', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border-subtle)'
                            }}>
                                <div style={{ padding: '8px', background: 'var(--color-success)', borderRadius: '8px', color: 'black' }}>
                                    <CheckSquare size={16} />
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <p style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {localFiles.find(f => f.category === 'contract').name}
                                    </p>
                                    <button
                                        onClick={() => downloadFile(localFiles.find(f => f.category === 'contract'))}
                                        className="text-label"
                                        style={{ color: 'var(--color-accent)', cursor: 'pointer', background: 'none', border: 'none', padding: 0, marginTop: '2px' }}
                                    >
                                        Descargar PDF
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleDeleteFile(localFiles.find(f => f.category === 'contract').id)}
                                    className="btn-ghost"
                                    style={{ color: 'var(--color-danger)' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ) : (
                            <div style={{
                                position: 'relative', // Fix: Validate scope for absolute child
                                height: '100px',
                                border: '2px dashed var(--border-subtle)',
                                borderRadius: 'var(--radius-lg)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-text-secondary)',
                                textAlign: 'center',
                                fontSize: '12px'
                            }}>
                                <p style={{ marginBottom: '4px' }}>Arrastra el PDF aquí</p>
                                <span style={{ opacity: 0.5 }}>o haz clic para subir</span>
                                <input
                                    type="file"
                                    onChange={async (e) => {
                                        if (e.target.files[0]) {
                                            await saveFile(e.target.files[0], id, 'contract');
                                            loadFiles();
                                        }
                                    }}
                                    style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Finance Card */}
                    <div className="card" style={{ background: 'linear-gradient(180deg, var(--color-bg-secondary) 0%, rgba(37, 99, 235, 0.05) 100%)', border: '1px solid var(--color-accent-soft)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <div style={{ padding: '8px', borderRadius: '50%', background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>
                                <Euro size={18} />
                            </div>
                            <h3 className="text-h3" style={{ fontSize: '16px' }}>Finanzas</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="text-label" style={{ marginBottom: '8px', display: 'block' }}>Ingreso Mensual</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number"
                                        value={project.revenue || ''}
                                        onChange={(e) => updateProject(id, { revenue: Number(e.target.value) })}
                                        placeholder="0"
                                        style={{
                                            width: '100%', padding: '12px 12px 12px 36px',
                                            background: 'var(--color-bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', color: 'white',
                                            fontWeight: '600', fontSize: '16px'
                                        }}
                                    />
                                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }}>€</span>
                                </div>
                            </div>

                            <div style={{ padding: '12px', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-subtle)' }}>
                                <label className="text-label" style={{ marginBottom: '4px', display: 'block' }}>Proyección Anual</label>
                                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-success)' }}>
                                    {((project.revenue || 0) * 12).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documents & Files Card */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 className="text-h3" style={{ fontSize: '16px' }}>Archivos & Enlaces</h3>
                        </div>

                        {/* Mixed List: Links + Files */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>

                            {/* Empty State */}
                            {(!project.documents?.length && localFiles.length === 0) && (
                                <div style={{
                                    border: '2px dashed var(--border-subtle)', borderRadius: '8px', padding: '20px',
                                    textAlign: 'center', color: 'var(--color-text-secondary)'
                                }}>
                                    <UploadCloud size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                                    <p className="text-label">Arrastra archivos aquí o añade enlaces</p>
                                </div>
                            )}

                            {/* External Links */}
                            {project.documents?.map(doc => (
                                <div key={doc.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '8px', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)',
                                    fontSize: '14px'
                                }}>
                                    <LinkIcon size={14} color="var(--color-accent)" />
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, color: 'inherit', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {doc.name}
                                    </a>
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ padding: '4px' }}>
                                        <ExternalLink size={12} />
                                    </a>
                                    <button onClick={() => handleDeleteDoc(doc.id)} className="btn-ghost" style={{ padding: '4px', color: 'var(--color-danger)' }}>
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}

                            {/* Local Files (Excluding Contract) */}
                            {localFiles.filter(f => f.category !== 'contract').map(file => (
                                <div key={file.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '8px', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)',
                                    fontSize: '14px'
                                }}>
                                    <FileText size={14} color="var(--color-warning)" />
                                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text-muted)' }}>
                                        {file.name}
                                    </span>
                                    <button onClick={() => downloadFile(file)} className="btn-ghost" style={{ padding: '4px' }}>
                                        <Download size={14} />
                                    </button>
                                    <button onClick={() => handleDeleteFile(file.id)} className="btn-ghost" style={{ padding: '4px', color: 'var(--color-danger)' }}>
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setIsDocModalOpen(true)}
                                className="btn btn-ghost"
                                style={{ flex: 1, justifyContent: 'center', fontSize: '12px', border: '1px solid var(--border-subtle)' }}
                            >
                                <Plus size={14} /> Enlace
                            </button>
                            <label
                                className="btn btn-ghost"
                                style={{ flex: 1, justifyContent: 'center', fontSize: '12px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                            >
                                <UploadCloud size={14} /> Archivo
                                <input type="file" multiple style={{ display: 'none' }} onChange={handleFileInput} />
                            </label>
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="card">
                        <h3 className="text-h3" style={{ fontSize: '16px', marginBottom: '16px' }}>Detalles</h3>

                        <div style={{ marginBottom: '16px' }}>
                            <p className="text-label">Estado</p>
                            <div style={{ display: 'inline-block', marginTop: '4px', padding: '4px 8px', borderRadius: '4px', background: 'var(--color-success)', color: 'black', fontSize: '12px', fontWeight: 'bold' }}>
                                {project.status.toUpperCase()}
                            </div>
                        </div>

                        <div>
                            <p className="text-label">Notas Internas</p>
                            <textarea
                                value={project.notes || ''}
                                onChange={(e) => updateProject(id, { notes: e.target.value })}
                                placeholder="Notas rápidas..."
                                style={{
                                    width: '100%', height: '120px', marginTop: '8px',
                                    background: 'var(--color-bg-primary)', border: 'none', borderRadius: '8px', padding: '8px', color: 'var(--color-text-primary)'
                                }}
                            />
                        </div>
                    </div>
                </aside>

            </div>

            {/* Add Document Modal */}
            <Modal isOpen={isDocModalOpen} onClose={() => setIsDocModalOpen(false)} title="Añadir Enlace Web">
                <form onSubmit={handleAddDoc} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                        <label className="text-label">Nombre</label>
                        <input
                            autoFocus
                            value={newDoc.name}
                            onChange={e => setNewDoc({ ...newDoc, name: e.target.value })}
                            placeholder="Ej. Drive Carpeta Compartida"
                            style={{ width: '100%', padding: '10px', marginTop: '4px', background: 'var(--color-bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label className="text-label">URL / Enlace</label>
                        <input
                            value={newDoc.url}
                            onChange={e => setNewDoc({ ...newDoc, url: e.target.value })}
                            placeholder="https://..."
                            style={{ width: '100%', padding: '10px', marginTop: '4px', background: 'var(--color-bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>Añadir Enlace</button>
                </form>
            </Modal>

            {/* Update Logo Modal */}
            <Modal isOpen={isLogoModalOpen} onClose={() => setIsLogoModalOpen(false)} title="Actualizar Logo">
                <form onSubmit={handleUpdateLogo} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                        <label className="text-label">URL de la Imagen</label>
                        <input
                            autoFocus
                            value={logoUrl}
                            onChange={e => setLogoUrl(e.target.value)}
                            placeholder="https://example.com/logo.png"
                            style={{ width: '100%', padding: '10px', marginTop: '4px', background: 'var(--color-bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>Guardar Logo</button>
                </form>
            </Modal>

            {/* Task Detail Modal */}
            {selectedTask && (
                <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="Detalles de la Tarea">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        <div>
                            <label className="text-label">Título</label>
                            <input
                                value={selectedTask.title}
                                onChange={e => setSelectedTask({ ...selectedTask, title: e.target.value })}
                                style={{
                                    width: '100%', padding: '12px', marginTop: '4px',
                                    background: 'var(--color-bg-tertiary)', border: '1px solid transparent', borderRadius: 'var(--radius-lg)', color: 'white',
                                    fontWeight: '600', fontSize: '16px'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                            <div>
                                <label className="text-label">Fecha de Entrega</label>
                                <input
                                    type="date"
                                    value={selectedTask.dueDate ? selectedTask.dueDate.split('T')[0] : ''}
                                    onChange={e => {
                                        const currentDate = selectedTask.dueDate ? new Date(selectedTask.dueDate) : new Date();
                                        const [y, m, d] = e.target.value.split('-').map(Number);
                                        currentDate.setFullYear(y, m - 1, d);
                                        setSelectedTask({ ...selectedTask, dueDate: currentDate.toISOString() });
                                    }}
                                    style={{
                                        width: '100%', padding: '10px', marginTop: '4px',
                                        background: 'var(--color-bg-tertiary)', border: '1px solid transparent', borderRadius: 'var(--radius-lg)', color: 'white'
                                    }}
                                />
                            </div>
                            <div>
                                <label className="text-label">Hora (Opcional)</label>
                                <input
                                    type="time"
                                    value={selectedTask.dueDate ? (new Date(selectedTask.dueDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })) : ''}
                                    onChange={e => {
                                        const currentDate = selectedTask.dueDate ? new Date(selectedTask.dueDate) : new Date();
                                        const [h, m] = e.target.value.split(':').map(Number);
                                        currentDate.setHours(h, m);
                                        setSelectedTask({ ...selectedTask, dueDate: currentDate.toISOString() });
                                    }}
                                    style={{
                                        width: '100%', padding: '10px', marginTop: '4px',
                                        background: 'var(--color-bg-tertiary)', border: '1px solid transparent', borderRadius: 'var(--radius-lg)', color: 'white'
                                    }}
                                />
                            </div>
                            <div>
                                <label className="text-label">Prioridad</label>
                                <select
                                    value={selectedTask.priority}
                                    onChange={e => setSelectedTask({ ...selectedTask, priority: e.target.value })}
                                    style={{
                                        width: '100%', padding: '10px', marginTop: '4px',
                                        background: 'var(--color-bg-tertiary)', border: '1px solid transparent', borderRadius: 'var(--radius-lg)', color: 'white'
                                    }}
                                >
                                    <option value="low">Baja</option>
                                    <option value="medium">Media</option>
                                    <option value="high">Alta</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-label">Notas</label>
                            <textarea
                                value={selectedTask.notes || ''}
                                onChange={e => setSelectedTask({ ...selectedTask, notes: e.target.value })}
                                placeholder="Añadir notas, detalles o subtareas..."
                                style={{
                                    width: '100%', height: '150px', padding: '12px', marginTop: '4px',
                                    background: 'var(--color-bg-tertiary)', border: '1px solid transparent', borderRadius: 'var(--radius-lg)', color: 'white',
                                    resize: 'none', lineHeight: '1.5'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    updateTask(selectedTask.id, selectedTask);
                                    setSelectedTask(null);
                                }}
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default ProjectDetail;
