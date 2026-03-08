import React, { useEffect, useState } from 'react';
import { attendance, auth } from '../services/api';
import Topbar from '../components/Topbar';

const AttendancePage = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const user = auth.getCurrentUser();

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const res = await attendance.getAll();
            setRecords(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleManualCheckout = async () => {
        try {
            await attendance.manualCheckout();
            fetchRecords();
            alert("Checked out successfully.");
        } catch (err) {
            alert("Checkout failed");
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Topbar />
            <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2>Attendance Log</h2>
                    <button className="secondary" onClick={handleManualCheckout}>Manual Check-out</button>
                </div>

                <div className="card">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-tertiary)', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>User</th>
                                <th style={{ padding: '12px' }}>Role</th>
                                <th style={{ padding: '12px' }}>Check In</th>
                                <th style={{ padding: '12px' }}>Check Out</th>
                                <th style={{ padding: '12px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(r => (
                                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '12px' }}>{r.user_name || `ID ${r.user_id}`} {r.user_id === user?.id && '(You)'}</td>
                                    <td style={{ padding: '12px' }}>{r.user_role}</td>
                                    <td style={{ padding: '12px' }}>{new Date(r.check_in_time).toLocaleString()}</td>
                                    <td style={{ padding: '12px' }}>
                                        {r.check_out_time ? new Date(r.check_out_time).toLocaleString() : '-'}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            color: r.status === 'Online' ? 'var(--success)' : 'var(--text-secondary)',
                                            fontWeight: 'bold'
                                        }}>
                                            {r.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {loading && <div style={{ padding: '16px', textAlign: 'center' }}>Loading...</div>}
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;
