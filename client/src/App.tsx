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

    const [progress, setProgress] = useState<{ percent: number, estimatedTime: number } | null>(null);

    const handleProcess = async () => {
        if (!text.trim()) return;

        setLoading(true);
        setLogs([]);
        setProgress({ percent: 0, estimatedTime: 0 });

        const links = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

        try {
            const response = await fetch(`${apiUrl}/print`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ links, format })
            });

            if (!response.body) throw new Error("ReadableStream not supported in this browser.");

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');

                // Processa todas as linhas completas
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const data = JSON.parse(line);

                        // Atualiza logs se houver resultado
                        if (data.result) {
                            setLogs(prev => [...prev, data.result]);
                        }

                        // Atualiza barra de progresso
                        if (typeof data.percent === 'number') {
                            setProgress({
                                percent: data.percent,
                                estimatedTime: data.estimatedTime || 0
                            });
                        }

                    } catch (err) {
                        console.warn("JSON Parse Error in chunk:", line);
                    }
                }
            }

        } catch (error: any) {
            console.error("Error processing links", error);
            setLogs(prev => [...prev, { url: 'System', status: 'error', message: error.message || 'Falha na conexão' }]);
        } finally {
            setLoading(false);
            setProgress(null);
        }
    };

    return (
        <div className="app-container">
            <div className="glass-card">
                <header>
                    <h1>Print<span className="highlight" style={{ color: '#00d2ff', textShadow: '0 0 10px #00d2ff' }}>Full</span>Page</h1>
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

                {/* AREA DE PROGRESSO */}
                {loading && progress && (
                    <div className="progress-area" style={{ marginTop: '20px', padding: '0 20px' }}>
                        <div className="progress-labels" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px', color: '#ccc' }}>
                            <span>Progresso: {progress.percent}%</span>
                            <span>Tempo Restante: ~{progress.estimatedTime}s</span>
                        </div>
                        <div className="progress-track" style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                                className="progress-fill"
                                style={{
                                    height: '100%',
                                    width: `${progress.percent}%`,
                                    background: '#00d2ff',
                                    transition: 'width 0.5s ease'
                                }}
                            />
                        </div>
                    </div>
                )}

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
