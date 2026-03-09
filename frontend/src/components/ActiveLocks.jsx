import React, { useEffect, useState } from 'react';
import { admin, auth } from '../services/api';

const ActiveLocks = () => {
    const [locks, setLocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const user = auth.getCurrentUser();

    const fetchLocks = async () => {
        if (user?.role !== 'admin') return;
        setLoading(true);
        try {
            const res = await admin.getActiveLocks();
            setLocks(res.data);
        } catch (err) {
            console.error("Failed to load locks", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocks();
        const interval = setInterval(fetchLocks, 10000); // 10s poll
        return () => clearInterval(interval);
    }, []);

    const handleForceUnlock = async (lockId) => {
        if (!window.confirm("Are you sure you want to FORCE unlock this file? The user might lose unsaved work.")) return;
        try {
            await admin.forceUnlock(lockId);
            fetchLocks();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to force unlock");
        }
    };

    if (user?.role !== 'admin') return null;

    return (
        <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            padding: '24px',
            border: '1px solid var(--border)',
            marginTop: '24px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: 'var(--error)' }}>Active Locks (Admin Control)</h3>
                <button className="secondary" onClick={fetchLocks} disabled={loading} style={{ fontSize: '0.8rem', padding: '4px 8px' }}>Refresh</button>
            </div>

            {locks.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No active locks found.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {locks.map(lock => (
                        <div key={lock.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '4px',
                            border: '1px solid var(--border)'
                        }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{lock.file_name || `File #${lock.file_id}`}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    Locked by: <span style={{ color: 'var(--text-primary)' }}>{lock.user_name || `User #${lock.locked_by}`}</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    Since: {new Date(lock.locked_at).toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <button
                                    onClick={() => handleForceUnlock(lock.id)}
                                    style={{ background: 'var(--error)', border: 'none', color: 'white' }}
                                >
                                    Force Unlock
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActiveLocks;
