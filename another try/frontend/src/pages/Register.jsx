import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('employee');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password, role);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
        }}>
            <div className="card" style={{ width: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Join QUASAR</h2>
                {error && <div style={{ color: 'var(--error)', marginBottom: '16px' }}>{error}</div>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <select
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        style={{
                            padding: '12px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            color: 'var(--text-primary)',
                            fontSize: '14px'
                        }}
                    >
                        <option value="employee">Employee</option>
                        <option value="tech_lead">Tech Lead</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button type="submit" className="primary">Register</button>
                </form>
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    Already have an account? <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/login')}>Login</span>
                </div>
            </div>
        </div>
    );
};

export default Register;
