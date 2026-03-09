import React from 'react';
import Topbar from '../components/Topbar';

const PlaceholderModule = ({ title }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Topbar />
            <div style={{ flex: 1, padding: '24px' }}>
                <h2 style={{ color: 'var(--text-secondary)' }}>{title}</h2>
                {/* Intentionally blank space */}
            </div>
        </div>
    );
};

export default PlaceholderModule;
