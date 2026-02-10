import { app } from './app';
import { CleanupService } from './services/CleanupService';

const PORT = process.env.PORT || 3001;
const RETENTION_MINUTES = parseInt(process.env.RETENTION_MINUTES || '10', 10);

app.listen(PORT, () => {
    console.clear();
    console.log('=================================================');
    console.log(`🚀 SCRAPER PRO SERVER (Clean Arch Mode)`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📂 Downloads públicos em: http://localhost:${PORT}/downloads`);
    console.log('=================================================');

    // Inicia o serviço de limpeza automática
    const cleanupService = new CleanupService(RETENTION_MINUTES);
    cleanupService.start();
});
