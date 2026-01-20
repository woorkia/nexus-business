
import React from 'react';
import { useData } from '../../context/DataContext';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, CheckSquare, FolderKanban, Settings, LogOut } from 'lucide-react';



const Sidebar = () => {
    const { currentUser } = useData(); // Get current user from context

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Calendar, label: 'Agenda', path: '/agenda' },
        { icon: CheckSquare, label: 'Tareas', path: '/tasks' },
        { icon: FolderKanban, label: 'Proyectos', path: '/projects' },
    ];

    // If no user (shouldn't happen if auth guard works), fallback
    const user = currentUser || { name: 'Usuario', role: 'Invitado', color: '#9ca3af' };

    return (
        <aside style={{
            width: '280px', /* Wider for luxury feel */
            height: '100vh',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-8) var(--space-6)',
            background: 'var(--color-bg-secondary)'
        }}>
            {/* Brand */}
            <div style={{ marginBottom: 'var(--space-12)', paddingLeft: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px', height: '40px',
                        background: 'linear-gradient(135deg, var(--color-accent) 0%, #1e1b4b 100%)',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 15px var(--color-accent-soft)'
                    }}>
                        <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '50%' }}></div>
                    </div>
                    <div>
                        <h1 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: 1, color: 'white' }}>
                            Nexus
                        </h1>
                        <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '4px' }}>Sistema Central</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-4)',
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-pill)',
                            textDecoration: 'none',
                            color: isActive ? 'white' : 'var(--color-text-secondary)',
                            background: isActive ? 'var(--color-accent)' : 'transparent',
                            boxShadow: isActive ? '0 0 15px var(--color-accent-soft)' : 'none',
                            transition: 'all 0.2s ease',
                            fontWeight: isActive ? 600 : 500
                        })}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                                <span>{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer / User Profile */}
            <div style={{
                marginTop: 'auto',
                paddingTop: 'var(--space-6)',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: user.color || '#fff', // Use user color
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: 'white',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    {user.name ? user.name[0] : 'U'}
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: '600' }}>{user.name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{user.role}</p>
                </div>
                <button className="btn-ghost" style={{ padding: '8px', borderRadius: '50%' }}>
                    <Settings size={18} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
