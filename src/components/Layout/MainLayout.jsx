
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', background: 'var(--color-bg-primary)' }}>
            <Sidebar />
            <main style={{
                flex: 1,
                overflowY: 'auto',
                padding: 'var(--space-8) var(--space-12)',
                maxWidth: '1600px',
                margin: '0 auto',
                width: '100%'
            }}>
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
