import React, { useEffect, useState } from 'react';
import { lock, version, workspace } from '../services/api';

const Editor = ({ selectedFile, user, refreshTimeline }) => {
    const [content, setContent] = useState('');
    const [currentLock, setCurrentLock] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (selectedFile) {
            if (selectedFile.isVirtual) {
                setContent(selectedFile.content || '');
                setCurrentLock(null);
            } else {
                loadFileContent();
                checkLockStatus();
            }
        } else {
            setContent('');
            setCurrentLock(null);
        }
    }, [selectedFile]);

    // Poll lock status every 5 seconds
    useEffect(() => {
        let interval;
        if (selectedFile && !selectedFile.isVirtual) {
            interval = setInterval(checkLockStatus, 5000);
        }
        return () => clearInterval(interval);
    }, [selectedFile]);

    const loadFileContent = async () => {
        try {
            const res = await workspace.getFileContent(selectedFile.id);
            setContent(res.data.content);
        } catch (err) {
            console.error(err);
        }
    };

    const checkLockStatus = async () => {
        if (!selectedFile || selectedFile.isVirtual) return;
        try {
            const res = await lock.getStatus(selectedFile.id);
            setCurrentLock(res.data); // data is lock obj or null
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeclareIntent = async () => {
        if (selectedFile.isVirtual) return;
        setLoading(true);
        try {
            const res = await lock.declare(selectedFile.id); // Now calls intent endpoint
            if (res.data.status === 'PENDING') {
                setMessage('Lock request submitted. Waiting for approval (Tech Lead/Admin).');
            } else if (res.data.status === 'APPROVED') {
                await checkLockStatus(); // Should show locked by me
                setMessage('Lock acquired (Auto-Approved)! You can now edit.');
            } else {
                setMessage(res.data.message || 'Intent processed');
            }
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to request lock');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelIntent = async () => {
        if (selectedFile.isVirtual) return;
        setLoading(true);
        try {
            await lock.cancel(selectedFile.id);
            await checkLockStatus();
            loadFileContent(); // Revert to saved content
            setMessage('Lock released. Changes discarded.');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveVersion = async () => {
        if (selectedFile.isVirtual) return;
        setLoading(true);
        try {
            await version.save(selectedFile.id, content);
            await checkLockStatus();
            refreshTimeline();
            setMessage('Version saved and lock released.');
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    if (!selectedFile) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                Select a file to view content
            </div>
        );
    }

    const isLockedByMe = currentLock && currentLock.locked_by === user.id;
    const isLockedByOther = currentLock && currentLock.locked_by !== user.id;
    const isReadOnly = !isLockedByMe || selectedFile.isVirtual;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>{selectedFile.name} {selectedFile.isVirtual && <span style={{ fontSize: '0.8rem', color: 'var(--accent)', verticalAlign: 'middle' }}>(Virtual)</span>}</h3>
                <div style={{ fontSize: '0.9rem' }}>
                    {selectedFile.isVirtual && <span style={{ color: 'var(--accent)' }}>✨ AI Generated Report</span>}
                    {!selectedFile.isVirtual && (
                        <>
                            {isLockedByMe && <span style={{ color: 'var(--success)' }}>🟢 Locked by You (Editing)</span>}
                            {isLockedByOther && <span style={{ color: 'var(--error)' }}>🔴 Locked by User {currentLock.locked_by}</span>}
                            {!currentLock && <span style={{ color: 'var(--text-secondary)' }}>⚪ Read Only</span>}
                        </>
                    )}
                </div>
            </div>

            {message && (
                <div style={{
                    padding: '8px',
                    marginBottom: '16px',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                }}>
                    {message} <button onClick={() => setMessage('')} style={{ float: 'right', padding: '0 4px', background: 'none' }}>x</button>
                </div>
            )}

            <textarea
                style={{
                    flex: 1,
                    resize: 'none',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    marginBottom: '16px',
                    opacity: isReadOnly ? 0.7 : 1,
                    cursor: isReadOnly ? 'not-allowed' : 'text',
                    backgroundColor: selectedFile.isVirtual ? 'var(--bg-tertiary)' : 'transparent'
                }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                readOnly={isReadOnly}
            />

            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                {!selectedFile.isVirtual && (
                    <>
                        {!currentLock && (
                            <button className="primary" onClick={handleDeclareIntent} disabled={loading}>
                                {(user?.role === 'admin' || user?.role === 'tech_lead') ? 'Lock File' : 'Request Lock'}
                            </button>
                        )}

                        {isLockedByMe && (
                            <>
                                <button className="primary" onClick={handleSaveVersion} disabled={loading}>
                                    Save Version
                                </button>
                                <button className="secondary" onClick={handleCancelIntent} disabled={loading}>
                                    Cancel Intent
                                </button>
                            </>
                        )}

                        {isLockedByOther && (
                            <button disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                                File is Locked
                            </button>
                        )}
                    </>
                )}
                {selectedFile.isVirtual && (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        This is a system generated report and cannot be edited.
                    </span>
                )}
            </div>
        </div>
    );
};

export default Editor;
