import React, { useState } from 'react';
import { workspace } from '../services/api';

const FolderNode = ({ node, onSelectFile, level = 0, onRefresh, projectId }) => {
    const [expanded, setExpanded] = useState(false);

    // Files in this folder
    const files = node.files || [];
    // Subfolders
    const children = node.children || [];

    const handleAddSubfolder = async (e) => {
        e.stopPropagation();
        const name = prompt("Enter new folder name:");
        if (name) {
            try {
                await workspace.createFolder({ name, project_id: projectId, parent_id: node.id });
                onRefresh();
                setExpanded(true);
            } catch (err) {
                alert("Failed to create folder");
            }
        }
    };

    const handleCreateFile = async (e) => {
        e.stopPropagation();
        const name = prompt("Enter new file name:");
        if (name) {
            try {
                await workspace.createFile({ name, project_id: projectId, folder_id: node.id });
                onRefresh();
                setExpanded(true);
            } catch (err) {
                alert("Failed to create file");
            }
        }
    };

    const handleDeleteFolder = async (e) => {
        e.stopPropagation();
        if (window.confirm(`Delete folder "${node.name}" and all contents?`)) {
            try {
                await workspace.deleteFolder(node.id);
                onRefresh();
            } catch (err) {
                alert("Failed to delete folder");
            }
        }
    };

    const handleDeleteFile = async (e, fileId) => {
        e.stopPropagation();
        if (window.confirm("Delete this file?")) {
            try {
                await workspace.deleteFile(fileId);
                onRefresh();
            } catch (err) {
                alert("Failed to delete file");
            }
        }
    };

    return (
        <div style={{ paddingLeft: level === 0 ? 0 : '16px' }}>
            <div
                style={{
                    cursor: 'pointer',
                    padding: '4px 0',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingRight: '8px'
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '8px', color: 'var(--accent)' }}>
                        {expanded ? '[-]' : '[+]'}
                    </span>
                    <span style={{ fontWeight: 'bold' }}>{node.name}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ padding: '0 4px', fontSize: '10px' }} onClick={handleAddSubfolder}>+📂</button>
                    <button style={{ padding: '0 4px', fontSize: '10px' }} onClick={handleCreateFile}>+📄</button>
                    <button style={{ padding: '0 4px', fontSize: '10px', color: 'var(--error)' }} onClick={handleDeleteFolder}>×</button>
                </div>
            </div>

            {expanded && (
                <div style={{ borderLeft: '1px solid var(--border)', marginLeft: '7px' }}>
                    {children.map(child => (
                        <FolderNode key={child.id} node={child} onSelectFile={onSelectFile} level={level + 1} onRefresh={onRefresh} projectId={projectId} />
                    ))}
                    {files.map(file => (
                        <div
                            key={file.id}
                            style={{
                                paddingLeft: '24px',
                                padding: '4px 8px 4px 24px',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                            onClick={() => onSelectFile(file)}
                        >
                            <span>📄 {file.name}</span>
                            <button
                                style={{ padding: '0 4px', fontSize: '10px', color: 'var(--error)', background: 'none' }}
                                onClick={(e) => handleDeleteFile(e, file.id)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    {children.length === 0 && files.length === 0 && (
                        <div style={{ paddingLeft: '24px', fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            (Empty)
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const FolderTree = ({ structure, onSelectFile, onRefresh, projectId }) => {
    if (!structure) return <div>Loading...</div>;

    const handleAddRootFolder = async () => {
        const name = prompt("Enter root folder name:");
        if (name) {
            try {
                await workspace.createFolder({ name, project_id: projectId });
                onRefresh();
            } catch (err) {
                alert("Failed to create folder");
            }
        }
    };

    const handleAddRootFile = async () => {
        const name = prompt("Enter root file name:");
        if (name) {
            try {
                await workspace.createFile({ name, project_id: projectId });
                onRefresh();
            } catch (err) {
                alert("Failed to create file");
            }
        }
    };

    return (
        <div style={{ padding: '16px', color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Explorer</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button title="Add Root Folder" style={{ padding: '2px 6px' }} onClick={handleAddRootFolder}>+📂</button>
                    <button title="Add Root File" style={{ padding: '2px 6px' }} onClick={handleAddRootFile}>+📄</button>
                </div>
            </div>

            <div>
                {structure.folders.map(folder => (
                    <FolderNode
                        key={folder.id}
                        node={folder}
                        onSelectFile={onSelectFile}
                        onRefresh={onRefresh}
                        projectId={projectId}
                    />
                ))}
                {structure.files.map(file => (
                    <div
                        key={file.id}
                        style={{
                            padding: '4px 0',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}
                        onClick={() => onSelectFile(file)}
                    >
                        <span>📄 {file.name}</span>
                        <button
                            style={{ padding: '0 4px', fontSize: '10px', color: 'var(--error)', background: 'none' }}
                            onClick={async (e) => {
                                e.stopPropagation();
                                if (window.confirm("Delete file?")) {
                                    await workspace.deleteFile(file.id);
                                    onRefresh();
                                }
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FolderTree;
