import React, { useEffect, useState } from 'react';
import { lock } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LockRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const { role } = useAuth();

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await lock.getPendingIntents();
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        const interval = setInterval(fetchRequests, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const handleApprove = async (id) => {
        try {
            await lock.approveIntent(id);
            fetchRequests(); // Refresh
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to approve');
        }
    };

    const handleReject = async (id) => {
        try {
            await lock.rejectIntent(id);
            fetchRequests(); // Refresh
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to reject');
        }
    };

    if (role === 'employee') return null;

    return (
        <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            padding: '24px',
            border: '1px solid var(--border)',
            marginTop: '24px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: 'var(--accent)' }}>Lock Requests</h3>
                <button className="secondary" onClick={fetchRequests} disabled={loading} style={{ fontSize: '0.8rem', padding: '4px 8px' }}>Refresh</button>
            </div>

            {requests.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No pending requests.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {requests.map(req => (
                        <div key={req.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '4px',
                            border: '1px solid var(--border)'
                        }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{req.file_name || `File #${req.file_id}`}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    Requested by: <span style={{ color: 'var(--text-primary)' }}>{req.requester_name || `User #${req.requested_by}`}</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {new Date(req.created_at).toLocaleString()}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => handleApprove(req.id)}
                                    style={{ background: 'var(--success)', border: 'none', color: 'white' }}
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleReject(req.id)}
                                    style={{ background: 'var(--error)', border: 'none', color: 'white' }}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LockRequests;
