import React, { useEffect, useState } from 'react';
import { version } from '../services/api';

const Timeline = ({ selectedFile, refreshTrigger }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (selectedFile && !selectedFile.isVirtual) {
            fetchHistory();
        } else {
            setHistory([]);
        }
    }, [selectedFile, refreshTrigger]);

    const fetchHistory = async () => {
        if (!selectedFile || selectedFile.isVirtual) return;
        try {
            const res = await version.getHistory(selectedFile.id);
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    if (!selectedFile) return <div style={{ padding: '16px', color: 'var(--text-secondary)' }}>Select file for timeline</div>;

    return (
        <div style={{ padding: '16px', height: '100%', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {history.map((ver, idx) => (
                    <div key={ver.id} style={{ borderLeft: '2px solid var(--border)', paddingLeft: '12px' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {new Date(ver.created_at).toLocaleString()}
                        </div>
                        <div style={{ fontWeight: 'bold' }}>
                            Version {history.length - idx}
                        </div>
                        <div style={{ fontSize: '0.9rem' }}>
                            by {ver.creator_name || 'User ' + ver.created_by}
                        </div>
                    </div>
                ))}
                {history.length === 0 && <div>No history</div>}
            </div>
        </div>
    );
};

export default Timeline;
