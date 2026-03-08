import React, { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import { useNavigate } from 'react-router-dom';
import { workspace } from '../services/api';
import LockRequests from '../components/LockRequests';
import ActiveLocks from '../components/ActiveLocks';
import Meet from '../components/Meet';

const Dashboard = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const user = React.useMemo(() => JSON.parse(localStorage.getItem('user')), []);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await workspace.getProjects();
            setProjects(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Topbar />
            <div style={{ padding: '0 24px', flex: 1, paddingBottom: '32px' }}>
                <div className="grid-layout" style={{ marginTop: '24px' }}>
                    <div
                        className="card"
                        style={{
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '150px',
                            border: '2px solid var(--accent)'
                        }}
                        onClick={() => {
                            if (projects.length > 0) {
                                navigate(`/workspace/${projects[0].id}`);
                            } else {
                                alert('No projects found. Please seed db.');
                            }
                        }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Workspace</h3>
                            <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>File Collaboration</p>
                        </div>
                    </div>
                    <div className="card" style={{ cursor: 'pointer', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => navigate('/ai')}>
                        <h3 style={{ margin: 0 }}>AI Module</h3>
                    </div>
                    <div className="card" style={{ cursor: 'pointer', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => navigate('/attendance')}>
                        <h3 style={{ margin: 0 }}>Attendance</h3>
                    </div>
                    <div className="card" style={{ cursor: 'pointer', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => navigate('/progress')}>
                        <h3 style={{ margin: 0 }}>Personal Progress</h3>
                    </div>
                    {user?.role === 'admin' && (
                        <div className="card" style={{ cursor: 'pointer', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--error)' }} onClick={() => navigate('/admin')}>
                            <div style={{ textAlign: 'center' }}>
                                <h3 style={{ margin: 0, color: 'var(--error)' }}>Admin Panel</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem' }}>User Mgmt & Logs</p>
                            </div>
                        </div>
                    )}
                </div>

                <Meet />
                <LockRequests />

                {/* Admin Only: Force Unlock Panel */}
                {user?.role === 'admin' && <ActiveLocks />}
            </div>
        </div>
    );
};

export default Dashboard;
