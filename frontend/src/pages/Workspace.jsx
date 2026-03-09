import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Topbar from '../components/Topbar';
import FolderTree from '../components/FolderTree';
import Editor from '../components/Editor';
import Timeline from '../components/Timeline';
import { workspace, auth, ai } from '../services/api';

const Workspace = () => {
    const { projectId } = useParams();
    const [structure, setStructure] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [refreshTimelineTrigger, setRefreshTimelineTrigger] = useState(0);
    const user = auth.getCurrentUser();

    useEffect(() => {
        fetchStructure();
    }, [projectId]);

    const fetchStructure = async () => {
        try {
            const res = await workspace.getProjectStructure(projectId);
            setStructure(res.data.structure);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Topbar />
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Left Panel: Folder Tree */}
                <div style={{ width: '250px', borderRight: '1px solid var(--border)', overflowY: 'auto', backgroundColor: 'var(--bg-secondary)' }}>
                    <FolderTree
                        structure={structure}
                        onSelectFile={setSelectedFile}
                        onRefresh={() => fetchStructure()}
                        projectId={projectId}
                    />
                </div>

                {/* Center Panel: Editor */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <Editor
                        selectedFile={selectedFile}
                        user={user}
                        refreshTimeline={() => setRefreshTimelineTrigger(t => t + 1)}
                    />
                </div>

                {/* Right Panel: Tabs/Timeline */}
                <div style={{ width: '300px', borderLeft: '1px solid var(--border)', overflowY: 'auto', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ borderBottom: '1px solid var(--border)', display: 'flex' }}>
                        <div style={{ padding: '8px 16px', borderBottom: '2px solid var(--accent)', cursor: 'pointer' }}>Timeline</div>
                        <div style={{ padding: '8px 16px', color: 'var(--text-secondary)', cursor: 'pointer' }}>Chat (Mock)</div>
                    </div>

                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                        <button
                            style={{ width: '100%', padding: '8px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            onClick={async () => {
                                const btn = document.getElementById('ai-btn');
                                if (btn) { btn.disabled = true; btn.innerText = "Analyzing..."; }
                                try {
                                    const res = await ai.generateReport(projectId);
                                    if (res.data.error) {
                                        alert("AI Error: " + res.data.error);
                                    } else {
                                        // Open as virtual file
                                        setSelectedFile({
                                            id: 'virtual-ai-report',
                                            name: `AI_Report_${new Date().toISOString().split('T')[0]}.md`,
                                            content: res.data.report_content,
                                            isVirtual: true
                                        });
                                    }
                                } catch (err) {
                                    alert("Analysis Failed. Check console.");
                                    console.error(err);
                                } finally {
                                    if (btn) { btn.disabled = false; btn.innerText = "Generate AI Analysis"; }
                                }
                            }}
                            id="ai-btn"
                        >
                            Generate AI Analysis
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <Timeline selectedFile={selectedFile} refreshTrigger={refreshTimelineTrigger} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Workspace;
