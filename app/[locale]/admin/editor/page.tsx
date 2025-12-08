'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import JsonEditor from '@/components/admin/JsonEditor';

export default function AdminEditorPage() {
    const { user, isAdmin } = useAuth();
    const router = useRouter();
    const [files, setFiles] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    // We keep two states: raw string (for saving/raw edit) and parsed object (for visual edit)
    const [fileContent, setFileContent] = useState<string>('');
    const [parsedData, setParsedData] = useState<any>(null);

    const [loading, setLoading] = useState(true);
    const [fileLoading, setFileLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [mode, setMode] = useState<'visual' | 'raw'>('visual');

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, loading, router]);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const res = await fetch('/api/admin/files');
            const data = await res.json();
            if (data.files) {
                setFiles(data.files);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch files', error);
            setLoading(false);
        }
    };

    const handleFileSelect = async (filename: string) => {
        setSelectedFile(filename);
        setFileLoading(true);
        setMessage(null);
        setParsedData(null);
        setFileContent('');

        try {
            const res = await fetch(`/api/admin/files/${filename}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const data = await res.json();

            if (data.content) {
                setFileContent(data.content);
                try {
                    setParsedData(JSON.parse(data.content));
                } catch (e) {
                    console.error("Failed to parse JSON for visual editor", e);
                    setMessage({ type: 'error', text: 'Invalid JSON content. Switched to Raw mode.' });
                    setMode('raw');
                }
            } else {
                setMessage({ type: 'error', text: 'File is empty' });
            }
        } catch (error) {
            console.error('Failed to fetch file content', error);
            setMessage({ type: 'error', text: 'Failed to load file content' });
        } finally {
            setFileLoading(false);
        }
    };

    const handleVisualChange = (newData: any) => {
        setParsedData(newData);
        setFileContent(JSON.stringify(newData, null, 4));
    };

    const handleRawChange = (newContent: string) => {
        setFileContent(newContent);
        try {
            setParsedData(JSON.parse(newContent));
        } catch (e) {
            // Ignore parse errors while typing in raw mode
        }
    };

    const handleSave = async () => {
        if (!selectedFile) return;
        setSaving(true);
        setMessage(null);

        try {
            // Validate JSON locally first
            try {
                JSON.parse(fileContent);
            } catch (e) {
                setMessage({ type: 'error', text: 'Invalid JSON. Please fix syntax errors before saving.' });
                setSaving(false);
                return;
            }

            const res = await fetch(`/api/admin/files/${selectedFile}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: fileContent }),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'File saved successfully!' });
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error || 'Failed to save file' });
            }
        } catch (error) {
            console.error('Error saving file', error);
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10">Loading...</div>;
    if (!isAdmin) return null;

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto h-full flex-shrink-0">
                <div className="p-4 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                    <h2 className="text-lg font-bold text-gray-800">Visa Files</h2>
                    <p className="text-xs text-gray-500">{files.length} files found</p>
                </div>
                <ul>
                    {files.map((file) => (
                        <li
                            key={file}
                            onClick={() => handleFileSelect(file)}
                            className={`p-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 text-sm truncate transition-colors ${selectedFile === file ? 'bg-blue-100 font-medium text-blue-700 border-l-4 border-l-blue-600' : 'text-gray-700 border-l-4 border-l-transparent'
                                }`}
                            title={file}
                        >
                            {file}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {selectedFile ? (
                    <>
                        {/* Header */}
                        <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-20">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-semibold text-gray-800">{selectedFile}</h2>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setMode('visual')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === 'visual' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Visual
                                    </button>
                                    <button
                                        onClick={() => setMode('raw')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === 'raw' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Raw JSON
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                {message && (
                                    <span
                                        className={`text-sm px-3 py-1 rounded-full font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {message.text}
                                    </span>
                                )}
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className={`px-6 py-2 rounded-lg text-white font-medium transition-all transform active:scale-95 ${saving
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'
                                        }`}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>

                        {/* Editor Content */}
                        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                            {fileLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                </div>
                            ) : mode === 'visual' ? (
                                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    {parsedData ? (
                                        <JsonEditor
                                            data={parsedData}
                                            onChange={handleVisualChange}
                                            isRoot={true}
                                        />
                                    ) : (
                                        <div className="text-center py-10 text-gray-500">
                                            {message?.type === 'error' ? 'Error loading data' : 'Invalid JSON. Switch to Raw mode to fix.'}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full rounded-lg overflow-hidden shadow-inner border border-gray-300">
                                    <textarea
                                        className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-green-400 resize-none focus:outline-none"
                                        value={fileContent}
                                        onChange={(e) => handleRawChange(e.target.value)}
                                        spellCheck={false}
                                    />
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                        <div className="text-6xl mb-4">📂</div>
                        <p className="text-lg font-medium">Select a file to start editing</p>
                    </div>
                )}
            </div>
        </div>
    );
}
