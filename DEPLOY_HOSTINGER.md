# Guia de Deploy - Hostinger

Este guia explica como colocar o **PrintFullPage** online na Hostinger.

## ⚠️ Importante sobre o Backend
Este projeto usa **Puppeteer** (Chrome Headless), o que exige um ambiente Node.js robusto.
- **VPS Hostinger**: ✅ Funciona 100%.
- **Hospedagem Compartilhada (Shared)**: ❌ **NÃO FUNCIONA BEM**. O Puppeteer exige bibliotecas do sistema que você não tem acesso para instalar em hospedagem compartilhada.

Se você tem apenas Hospedagem Compartilhada (plano "Single", "Premium", "Business"), você conseguirá hospedar apenas o Frontend (a parte visual), mas o Backend (que tira os prints) precisará rodar no seu PC local ou em uma VPS/Render/Railway.

---

## Opção A: Tenho VPS (Recomendado)

### 1. Preparar Arquivos
1. Envie a pasta `server` inteira para a VPS.
2. Envie a pasta `client/dist` (criada após o build) para a pasta pública do seu servidor web (ex: `/var/www/html` ou configurar no Nginx).

### 2. Rodar Backend
Na VPS, instale as dependências:
```bash
cd server
npm install
# Instalar dependências do sistema para o Chrome
sudo apt-get install -y ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils
# Rodar servidor (use PM2 para manter online)
npm install -g pm2
pm2 start index.js --name "print-server"
```

### 3. Configurar Frontend
Edite o arquivo `client/dist/.env` ou recompile o frontend apontando para o IP da sua VPS.

---

## Opção B: Hospedagem Compartilhada (Serve o Frontend + Backend Local/Externo)

Se você quer apenas colocar o site bonito no ar, mas usar seu PC para tirar os prints (ou outro serviço):

1. **Frontend**:
   - Pegue todo o conteúdo da pasta `client/dist`.
   - Abra o Gerenciador de Arquivos da Hostinger.
   - Vá para `public_html`.
   - Arraste os arquivos da pasta `dist` para lá.
   - O site estará online!

2. **Backend**:
   - O site vai tentar conectar em `http://localhost:3001` (se você não mudou o .env).
   - Se você mantiver o backend rodando no seu PC, o site online **SÓ VAI FUNCIONAR PARA VOCÊ** (no seu PC).
   - Para funcionar para todos, você precisa hospedar o folder `server` em um lugar como **Render.com** ou **Railway.app** (eles têm planos grátis que suportam Node.js/Puppeteer).
   - Após subir o backend no Render/Railway, pegue a URL (ex: `https://meu-print-app.onrender.com`) e coloque no arquivo `.env.production` do client, depois rode `npm run build` de novo e suba os arquivos novos.
