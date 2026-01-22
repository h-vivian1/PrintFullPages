import { app } from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.clear();
    console.log('=================================================');
    console.log(`🚀 SCRAPER PRO SERVER (Clean Arch Mode)`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📂 Downloads públicos em: http://localhost:${PORT}/downloads`);
    console.log('=================================================');
});
