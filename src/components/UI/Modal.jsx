
import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '500px',
                padding: '0',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--border-focus)',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div style={{
                    padding: 'var(--space-4) var(--space-6)',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 className="text-h3" style={{ fontSize: 'var(--size-lg)' }}>{title}</h3>
                    <button onClick={onClose} className="btn-ghost" style={{ padding: '4px' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: 'var(--space-6)' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
