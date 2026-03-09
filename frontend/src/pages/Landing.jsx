import React from 'react';
import Topbar from '../components/Topbar';

const Landing = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Topbar />
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                textAlign: 'center',
                padding: '24px'
            }}>
                <h1 style={{ fontSize: '4rem', margin: '0 0 24px 0', color: 'var(--accent)' }}>QUASAR</h1>
                <p style={{ fontSize: '1.5rem', maxWidth: '600px', margin: '0 0 48px 0', color: 'var(--text-secondary)' }}>
                    A modular collaboration platform built for speed and simplicity.
                    Focus on your work with our specialized workspaces.
                </p>
                <div>
                    {/* Actions handled by Topbar for now, or add big CTA here */}
                </div>
            </div>
        </div>
    );
};

export default Landing;
