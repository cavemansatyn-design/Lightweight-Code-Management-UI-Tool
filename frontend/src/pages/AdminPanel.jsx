import React, { useEffect, useState } from 'react';
import { admin, auth } from '../services/api';
import Topbar from '../components/Topbar';

const AdminPanel = () => {
    const [tab, setTab] = useState('users'); // users | logs
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);

    // Form state
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'employee' });

    const user = auth.getCurrentUser();

    useEffect(() => {
        if (tab === 'users') fetchUsers();
        if (tab === 'logs') fetchLogs();
    }, [tab]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await admin.getUsers();
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await admin.getLogs();
            setLogs(res.data);
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await admin.createUser(formData);
            setShowUserForm(false);
            setFormData({ name: '', email: '', password: '', role: 'employee' });
            fetchUsers();
            alert("User created");
        } catch (err) {
            alert(err.response?.data?.error || "Error creating user");
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure? This will delete the user and their attendance.")) return;
        try {
            await admin.deleteUser(id);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.error || "Error deleting user");
        }
    };

    if (user?.role !== 'admin') return <div style={{ padding: '20px' }}>Unauthorized: Admins Only</div>;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Topbar />
            <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                <h2 style={{ marginBottom: '24px' }}>Admin Panel</h2>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                    <div
                        style={{ padding: '8px 16px', cursor: 'pointer', borderBottom: tab === 'users' ? '2px solid var(--accent)' : 'none', fontWeight: tab === 'users' ? 'bold' : 'normal' }}
                        onClick={() => setTab('users')}
                    >
                        User Management
                    </div>
                    <div
                        style={{ padding: '8px 16px', cursor: 'pointer', borderBottom: tab === 'logs' ? '2px solid var(--accent)' : 'none', fontWeight: tab === 'logs' ? 'bold' : 'normal' }}
                        onClick={() => setTab('logs')}
                    >
                        System Logs
                    </div>
                </div>

                {tab === 'users' && (
                    <div>
                        <button className="primary" style={{ marginBottom: '16px' }} onClick={() => setShowUserForm(!showUserForm)}>
                            {showUserForm ? 'Cancel' : 'Add New User'}
                        </button>

                        {showUserForm && (
                            <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
                                <form onSubmit={handleCreateUser} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <input placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                    <input placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                                    <input placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="employee">Employee</option>
                                        <option value="tech_lead">Tech Lead</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <button type="submit" className="primary">Create</button>
                                </form>
                            </div>
                        )}

                        <div className="card">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-tertiary)', textAlign: 'left' }}>
                                        <th style={{ padding: '12px' }}>Name</th>
                                        <th style={{ padding: '12px' }}>Email</th>
                                        <th style={{ padding: '12px' }}>Role</th>
                                        <th style={{ padding: '12px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '12px' }}>{u.name}</td>
                                            <td style={{ padding: '12px' }}>{u.email}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem',
                                                    background: u.role === 'admin' ? 'var(--error)' : u.role === 'tech_lead' ? 'var(--accent)' : 'var(--bg-tertiary)',
                                                    color: u.role === 'admin' || u.role === 'tech_lead' ? 'white' : 'inherit'
                                                }}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                {u.id !== user.id && (
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        style={{ background: 'var(--error)', border: 'none', color: 'white', fontSize: '0.8rem', padding: '4px 8px' }}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === 'logs' && (
                    <div className="card">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-tertiary)', textAlign: 'left' }}>
                                    <th style={{ padding: '12px' }}>Time</th>
                                    <th style={{ padding: '12px' }}>Action</th>
                                    <th style={{ padding: '12px' }}>Performed By</th>
                                    <th style={{ padding: '12px' }}>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(l => (
                                    <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            {new Date(l.created_at).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{l.action_type}</td>
                                        <td style={{ padding: '12px' }}>{l.performer_name}</td>
                                        <td style={{ padding: '12px' }}>{l.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
