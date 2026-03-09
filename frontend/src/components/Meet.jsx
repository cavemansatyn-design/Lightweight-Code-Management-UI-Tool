import React, { useEffect, useState } from 'react';
import { meet, auth } from '../services/api';
import Topbar from './Topbar';

const Meet = () => {
    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(false);
    const [inMeeting, setInMeeting] = useState(false);
    const user = auth.getCurrentUser();

    const fetchMeeting = async () => {
        setLoading(true);
        try {
            const res = await meet.getActive();
            setMeeting(res.data);
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchMeeting();
        const interval = setInterval(fetchMeeting, 10000); // 10s poll
        return () => clearInterval(interval);
    }, []);

    const handleStart = async () => {
        try {
            await meet.start();
            fetchMeeting();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to start meeting");
        }
    };

    const handleEnd = async () => {
        if (!window.confirm("End the meeting for everyone?")) return;
        try {
            await meet.end();
            setMeeting(null);
            setInMeeting(false);
        } catch (err) {
            alert(err.response?.data?.error || "Failed to end meeting");
        }
    };

    return (
        <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            padding: '24px',
            border: '1px solid var(--border)',
            marginTop: '24px',
            height: inMeeting ? '600px' : 'auto'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: 'var(--accent)' }}>Top Level Meet</h3>
                {user?.role === 'tech_lead' && meeting && (
                    <button onClick={handleEnd} style={{ background: 'var(--error)', border: 'none', color: 'white', fontSize: '0.8rem', padding: '4px 8px' }}>
                        End Meeting
                    </button>
                )}
            </div>

            {!inMeeting ? (
                <div style={{ textAlign: 'center', padding: '24px' }}>
                    {meeting ? (
                        <div>
                            <div style={{ marginBottom: '16px', color: 'var(--success)', fontWeight: 'bold' }}>
                                Active Meeting in Progress
                            </div>
                            <button className="primary" onClick={() => setInMeeting(true)}>
                                Join Meeting
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                                No active meeting.
                            </div>
                            {user?.role === 'tech_lead' && (
                                <button className="primary" onClick={handleStart} disabled={loading}>
                                    Start Global Meeting
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <iframe
                    src={`https://meet.jit.si/${meeting.room_name}#userInfo.displayName="${user.name}"`}
                    allow="camera; microphone; fullscreen; display-capture"
                    style={{ width: '100%', height: '100%', border: 'none', borderRadius: '4px' }}
                />
            )}
        </div>
    );
};

export default Meet;
