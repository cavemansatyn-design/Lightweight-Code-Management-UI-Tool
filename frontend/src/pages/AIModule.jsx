import React, { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import { workspace, ai, auth } from '../services/api';

const AIModule = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [generating, setGenerating] = useState(false);
  const user = auth.getCurrentUser();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const res = await workspace.getProjects();
        const list = res.data || [];
        setProjects(list);
        if (list.length > 0 && !selectedProjectId) {
          setSelectedProjectId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load projects', err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [selectedProjectId]);

  useEffect(() => {
    const loadReports = async () => {
      if (!selectedProjectId) return;
      setLoadingReports(true);
      try {
        const res = await ai.getReports(selectedProjectId);
        const list = res.data || [];
        setReports(list);
        if (list.length > 0 && !selectedReport) {
          // Load the most recent report content
          const latest = list[0];
          const detail = await ai.getReport(latest.id);
          setSelectedReport(detail.data);
        }
      } catch (err) {
        console.error('Failed to load AI reports', err);
      } finally {
        setLoadingReports(false);
      }
    };
    loadReports();
  }, [selectedProjectId]);

  const handleGenerate = async () => {
    if (!selectedProjectId) {
      alert('Select a project first.');
      return;
    }
    setGenerating(true);
    try {
      const res = await ai.generateReport(selectedProjectId);
      if (res.data.error) {
        alert('AI Error: ' + res.data.error);
        return;
      }
      // Refresh reports and select the new one
      const listRes = await ai.getReports(selectedProjectId);
      const list = listRes.data || [];
      setReports(list);
      setSelectedReport(res.data);
    } catch (err) {
      console.error('Failed to generate AI report', err);
      alert('Failed to generate AI report. Check console for details.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectReport = async (id) => {
    try {
      const res = await ai.getReport(id);
      setSelectedReport(res.data);
    } catch (err) {
      console.error('Failed to load report', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar />
      <div style={{ flex: 1, display: 'flex', padding: '16px', gap: '16px' }}>
        <div
          style={{
            width: '260px',
            borderRight: '1px solid var(--border)',
            paddingRight: '16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h2 style={{ marginTop: 0 }}>AI Change Reports</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Compare initial vs latest versions across components and share a single report for everyone.
          </p>

          <label style={{ marginTop: '12px', fontSize: '0.9rem' }}>
            Project
            <select
              value={selectedProjectId || ''}
              onChange={(e) => {
                const id = e.target.value ? Number(e.target.value) : null;
                setSelectedProjectId(id);
                setSelectedReport(null);
              }}
              style={{ width: '100%', marginTop: '4px' }}
            >
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          {loadingProjects && <div style={{ marginTop: '8px' }}>Loading projects...</div>}

          <button
            className="primary"
            style={{ marginTop: '16px', padding: '8px' }}
            onClick={handleGenerate}
            disabled={generating || !selectedProjectId}
          >
            {generating ? 'Generating...' : 'Generate New AI Report'}
          </button>

          <div style={{ marginTop: '24px', flex: 1, overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Previous Reports</h3>
            {loadingReports && <div>Loading reports...</div>}
            {!loadingReports && reports.length === 0 && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                No reports yet for this project.
              </div>
            )}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {reports.map((r) => (
                <li
                  key={r.id}
                  style={{
                    padding: '6px 4px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    backgroundColor: selectedReport && selectedReport.id === r.id ? 'var(--bg-secondary)' : 'transparent',
                  }}
                  onClick={() => handleSelectReport(r.id)}
                >
                  <div style={{ fontSize: '0.9rem' }}>Report #{r.id}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px',
              height: '100%',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            {selectedReport ? (
              <>
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Project #{selectedReport.project_id} · Report #{selectedReport.id}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Generated at {new Date(selectedReport.created_at).toLocaleString()}
                  </div>
                </div>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.9rem',
                  }}
                >
                  {selectedReport.report_content}
                </pre>
              </>
            ) : (
              <div style={{ color: 'var(--text-secondary)' }}>
                Select a project and generate or choose a report to view the consolidated analysis here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModule;

