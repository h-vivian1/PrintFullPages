import { useState } from 'react';
import axios from 'axios';
import { Terminal, CheckCircle, XCircle, Loader2, FileImage, FileText } from 'lucide-react';
import './App.css';

interface Log {
    url: string;
    status: 'success' | 'error';
    path?: string;
    downloadUrl?: string;
    message?: string;
}

function App() {
    const [text, setText] = useState('');
    const [format, setFormat] = useState<'webp' | 'png' | 'pdf'>('webp');
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<Log[]>([]);

    const handleProcess = async () => {
        if (!text.trim()) return;

        setLoading(true);
        setLogs([]); // Clear previous logs

        // Split text by newlines and filter empty strings
        const links = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        try {
            // In a real world scenario heavily loaded with links, we might want to stream this or handle chunks.
            // For this vibe code MVP, sending all at once.
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await axios.post(`${apiUrl}/print`, {
                links,
                format
            });

            if (response.data && response.data.results) {
                setLogs(response.data.results);
            }
        } catch (error: any) {
            console.error("Error processing links", error);
            // Add a generic error log if the request fails completely
            setLogs([{ url: 'System', status: 'error', message: error.message || 'Falha na conexão com o servidor' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            <div className="glass-card">
                <header>
                    <h1>Web Capture <span className="highlight">Vibe</span></h1>
                </header>

                <div className="controls">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Cole seus links aqui (um por linha)..."
                        rows={8}
                        className="link-input"
                    />

                    <div className="actions-row">
                        <div className="format-toggle">
                            <button
                                className={format === 'webp' ? 'active' : ''}
                                onClick={() => setFormat('webp')}
                            >
                                WEBP
                            </button>
                            <button
                                className={format === 'png' ? 'active' : ''}
                                onClick={() => setFormat('png')}
                            >
                                PNG
                            </button>
                            <button
                                className={format === 'pdf' ? 'active' : ''}
                                onClick={() => setFormat('pdf')}
                            >
                                PDF
                            </button>
                        </div>

                        <button
                            className="process-btn"
                            onClick={handleProcess}
                            disabled={loading || !text.trim()}
                        >
                            {loading ? <Loader2 className="spin" /> : 'Processar Capturas'}
                        </button>
                    </div>
                </div>

                {logs.length > 0 && (
                    <div className="logs-container">
                        <h3><Terminal size={16} /> Logs de Execução</h3>
                        <div className="logs-list">
                            {logs.map((log, index) => (
                                <div key={index} className={`log-item ${log.status}`}>
                                    {log.status === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                    <span className="log-url" title={log.url}>{log.url}</span>

                                    {log.status === 'success' && (
                                        <a href={log.downloadUrl} target="_blank" rel="noopener noreferrer" className="download-link" title="Baixar Arquivo">
                                            {format === 'pdf' ? <FileText size={16} /> : <FileImage size={16} />}
                                            <span className="download-text">Abrir</span>
                                        </a>
                                    )}

                                    {log.status === 'error' && (
                                        <span className="log-msg">Erro: {log.message}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
