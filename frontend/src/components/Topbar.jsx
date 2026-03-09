import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';

const Topbar = () => {
    const navigate = useNavigate();
    const user = auth.getCurrentUser();

    const handleLogout = () => {
        auth.logout();
    };

    return (
        <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-secondary)'
        }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent)' }} onClick={() => navigate('/dashboard')}>
                QUASAR
            </div>
            <div>
                {user ? (
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span>{user.name}</span>
                        <button className="secondary" onClick={handleLogout}>Logout</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button onClick={() => navigate('/login')}>Login</button>
                        <button className="primary" onClick={() => navigate('/register')}>Register</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Topbar;
