
import React, { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [selectedUser, setSelectedUser] = useState(null); // 'samuel' | 'sergi'
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const users = [
        { id: 'samuel', name: 'Samuel', role: 'Fundador', color: 'var(--color-accent)' },
        { id: 'sergi', name: 'Sergi', role: 'Socio', color: '#10b981' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simple PIN check (same for both for MVP)
        if (pin === '0000' || pin === '1234' || pin === 'admin') {
            onLogin(users.find(u => u.id === selectedUser));
        } else {
            setError(true);
            setPin('');
            setTimeout(() => setError(false), 1000);
        }
    };

    return (
        <div style={{
            height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)'
        }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                <h1 className="text-h1" style={{ fontSize: '3rem', marginBottom: 'var(--space-2)' }}>Nexus.</h1>
                <p className="text-secondary">Sistema Operativo Empresarial</p>
            </div>

            {!selectedUser ? (
                // Profile Selection Screen
                <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
                    {users.map(user => (
                        <div
                            key={user.id}
                            onClick={() => setSelectedUser(user.id)}
                            className="card"
                            style={{
                                width: '200px', padding: 'var(--space-8)', textAlign: 'center', cursor: 'pointer',
                                transition: 'transform 0.2s', border: `1px solid ${user.color}`
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%', background: user.color,
                                margin: '0 auto var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '32px', fontWeight: 'bold', color: 'white'
                            }}>
                                {user.name[0]}
                            </div>
                            <h3 className="text-h3" style={{ marginBottom: '4px' }}>{user.name}</h3>
                            <p className="text-label">{user.role}</p>
                        </div>
                    ))}
                </div>
            ) : (
                // PIN Entry Screen
                <div className="card" style={{ width: '100%', maxWidth: '360px', textAlign: 'center', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)' }}>
                    <button
                        onClick={() => { setSelectedUser(null); setPin(''); setError(false); }}
                        className="btn-ghost"
                        style={{ position: 'absolute', top: '16px', left: '16px', color: 'var(--color-text-secondary)' }}
                    >
                        ← Volver
                    </button>

                    <div style={{
                        margin: '0 auto var(--space-6)',
                        width: '64px', height: '64px',
                        background: 'var(--color-bg-tertiary)', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px var(--color-accent-soft)',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <Lock size={28} color={selectedUser === 'samuel' ? 'var(--color-accent)' : '#10b981'} />
                    </div>

                    <h3 className="text-h3" style={{ marginBottom: 'var(--space-6)' }}>Hola, {users.find(u => u.id === selectedUser)?.name}</h3>

                    <form onSubmit={handleSubmit}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                value={pin}
                                onChange={e => setPin(e.target.value)}
                                maxLength={4}
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    textAlign: 'center',
                                    fontSize: '24px',
                                    letterSpacing: '12px',
                                    background: 'var(--color-bg-tertiary)',
                                    border: error ? '1px solid var(--color-danger)' : '1px solid transparent',
                                    borderRadius: 'var(--radius-pill)',
                                    color: 'white',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                                }}
                                placeholder="••••"
                            />
                            {error && <p style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '12px', fontWeight: 'bold' }}>PIN Incorrecto</p>}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{
                                width: '100%', marginTop: 'var(--space-8)', justifyContent: 'center', fontSize: '16px', padding: '14px',
                                background: selectedUser === 'samuel' ? 'var(--color-accent)' : '#10b981'
                            }}
                        >
                            Entrar <ArrowRight size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Login;
