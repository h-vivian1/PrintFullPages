import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { ScrapeController } from './controllers/ScrapeController';

const app: Application = express();

// Instanciação do Controller
const scrapeController = new ScrapeController();

// Middlewares Globais
app.use(cors()); // Permite que seu frontend React acesse a API
app.use(express.json());

// Configuração de Arquivos Estáticos (Downloads)
// Sai de /dist para /server/downloads (um nível acima)
const downloadsDir = path.join(__dirname, '../downloads');
app.use('/downloads', express.static(downloadsDir));

// Rotas
// Usamos arrow function para manter o contexto do 'this' se necessário no futuro
app.post('/print', (req, res) => { scrapeController.handle(req, res); });

// Rota de Health Check (pra saber se o server tá vivo)
app.get('/', (req, res) => {
    res.json({ status: 'Online', service: 'Scraper Pro API v2' });
});

export { app };
