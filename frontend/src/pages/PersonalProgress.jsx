import React, { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import { progress, auth } from '../services/api';

const PersonalProgress = () => {
  const [data, setData] = useState({ edited_files: [], lock_logs: [] });
  const [loading, setLoading] = useState(false);
  const user = auth.getCurrentUser();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await progress.getMyProgress();
        setData(res.data || { edited_files: [], lock_logs: [] });
      } catch (err) {
        console.error('Failed to load progress', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const { edited_files, lock_logs } = data;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar />
      <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ marginBottom: '16px' }}>Personal Progress</h2>
        <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
          Summary of files you have locked and edited across projects.
        </p>

        {loading && <div style={{ marginBottom: '16px' }}>Loading...</div>}

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '320px' }}>
            <div className="card" style={{ padding: '16px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Files You Edited</h3>
              {edited_files.length === 0 && (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  No version history yet. Lock a file, edit it, and save a version to see it here.
                </div>
              )}
              {edited_files.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-tertiary)', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>Project</th>
                      <th style={{ padding: '8px' }}>File</th>
                      <th style={{ padding: '8px' }}>Versions</th>
                      <th style={{ padding: '8px' }}>First Edit</th>
                      <th style={{ padding: '8px' }}>Last Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {edited_files.map((f) => (
                      <tr key={f.file_id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px' }}>{f.project_name}</td>
                        <td style={{ padding: '8px' }}>{f.file_name}</td>
                        <td style={{ padding: '8px' }}>{f.total_versions}</td>
                        <td style={{ padding: '8px' }}>
                          {new Date(f.first_edit_at).toLocaleString()}
                        </td>
                        <td style={{ padding: '8px' }}>
                          {new Date(f.last_edit_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '320px' }}>
            <div className="card" style={{ padding: '16px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Your Lock Activity</h3>
              {lock_logs.length === 0 && (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  No lock activity recorded yet.
                </div>
              )}
              {lock_logs.length > 0 && (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {lock_logs.map((l) => (
                    <div
                      key={l.id}
                      style={{
                        padding: '8px 0',
                        borderBottom: '1px solid var(--border)',
                        fontSize: '0.9rem',
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(l.created_at).toLocaleString()}
                      </div>
                      <div style={{ fontWeight: 'bold' }}>{l.action_type}</div>
                      <div>{l.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalProgress;

