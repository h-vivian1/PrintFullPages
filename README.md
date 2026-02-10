# 📸 MultiPage Capture - Capturador Web Fullstack

> Uma aplicação moderna para capturar screenshots de páginas inteiras com precisão e estilo.

![Status do Projeto](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow)
![Node Version](https://img.shields.io/badge/Node.js-v18%2B-green?logo=node.js)
![React](https://img.shields.io/badge/Frontend-React_TS-blue?logo=react)

## 🎯 O que ele faz?

O **MultiPage Capture** resolve o problema de tirar "prints" de sites longos. Ele utiliza automação de navegador para rolar a página inteira e capturar cada pixel, desde o cabeçalho até o rodapé, salvando o resultado localmente em alta resolução.

Tudo isso envolto em uma interface **Cyberpunk**.

## 🚀 Funcionalidades Principais

* 📜 **Captura Full Page:** Rola automaticamente a página para garantir que o conteúdo dinâmico (lazy loading) seja carregado antes do print.
* 🎨 **Múltiplos Formatos:** Escolha entre `.png` (alta qualidade), `.webp` (web otimizado) ou `.pdf` (documento).
* ⚡ **Processamento em Lote:** Cole múltiplos links (um por linha) e deixe o sistema processar todos em sequência.
* 💾 **Armazenamento Temporário:** As capturas são salvas automaticamente e **deletadas após 10 minutos** para economizar espaço.
* 🗂️ **Organização por Data:** Arquivos organizados em pastas `DD_MM` (dia/mês) para fácil localização.

---

## ⚠️ Limitações Conhecidas

### 🛡️ Sites com Proteção Anti-Bot

Alguns sites utilizam proteção contra automação que podem bloquear o Puppeteer:

**Proteções Comuns:**
- **Cloudflare:** Detecta navegadores headless e exibe desafios de verificação
- **reCAPTCHA:** Requer interação humana para validação
- **Rate Limiting:** Bloqueios após múltiplas requisições rápidas
- **WAF (Web Application Firewall):** Filtros de segurança avançados

**Sintomas de Bloqueio:**
- ❌ Página capturada mostra "Verificando se você é humano"
- ❌ Mensagem "Access Denied" ou "403 Forbidden"
- ❌ Página em branco ou incompleta
- ❌ Desafio CAPTCHA visível no screenshot

**Exemplo de Bloqueio Cloudflare:**

![Exemplo de bloqueio Cloudflare](https://i.imgur.com/example.png)
*Mensagem típica: "Verificando se você é humano. Isso pode levar alguns segundos."*

> [!NOTE]
> **Solução:** Para sites com proteção pesada, considere usar APIs oficiais quando disponíveis, ou ferramentas como `puppeteer-extra-plugin-stealth` para melhor evasão.

### 💾 Gerenciamento de Espaço

Para evitar acúmulo de arquivos no servidor:

- ⏱️ **Auto-exclusão:** Screenshots são **automaticamente deletados após 10 minutos**
- 🔄 **Verificação periódica:** Sistema verifica arquivos a cada 1 minuto
- 🗑️ **Limpeza de pastas vazias:** Pastas sem arquivos são removidas automaticamente
- ⚙️ **Configurável:** Tempo de retenção ajustável via variável de ambiente

**Para alterar o tempo de retenção:**
```env
# server/.env
RETENTION_MINUTES=30  # Manter por 30 minutos (padrão: 10)
```

> [!IMPORTANT]
> Em ambientes de produção (ex: Hostinger), certifique-se de que a variável `RETENTION_MINUTES` está configurada para evitar uso excessivo de disco.

---

## 🛠️ Tecnologias Utilizadas (Stack)

O projeto é dividido em duas partes principais:

### 🖥️ Frontend (Interface)
* **React + Vite:** Para performance extrema.
* **TypeScript:** Tipagem estática para código mais seguro.
* **Lucide React:** Ícones modernos e leves.
* **CSS Moderno:** Estilização Cyberpunk/Glassmorphism.

### ⚙️ Backend (API & Motor)
* **Node.js + Express:** Servidor leve e rápido.
* **Puppeteer:** A mágica por trás da automação do Chrome/Chromium para renderizar as páginas.

---

## Como Rodar o Projeto

Pré-requisitos: Tenha o [Node.js](https://nodejs.org/) instalado.

### ⚡ Modo Rápido (Recomendado)

O projeto inclui um script de inicialização automática para Windows.

1.  Na raiz do projeto, clique duas vezes no arquivo:
    `start_app.bat`
    *(Ou execute `.\start_app.bat` no terminal)*

Isso abrirá automaticamente:
- O Servidor Backend (Porta 3001)
- O Cliente Frontend (Porta 5173)
- E seu navegador padrão pronto para uso.

---

### Modo Manual (Opcional)

Caso prefira rodar terminal por terminal:

### Passo 1: Configurar e Rodar o Backend (Servidor)

O backend é responsável por processar as imagens e salvar os arquivos.

1.  Entre na pasta do servidor:
    ```bash
    cd server
    ```
2.  Instale as dependências (incluindo o Puppeteer) na primeira vez:
    ```bash
    npm install
    ```
3.  Inicie a API:
    ```bash
    npm run dev
    ```
    > 🟢 O servidor rodará em: `http://localhost:3001`

### Passo 2: Configurar e Rodar o Frontend (Cliente)

1.  Abra um novo terminal e entre na pasta do cliente:
    ```bash
    cd client
    ```
2.  Instale as dependências na primeira vez:
    ```bash
    npm install
    ```
3.  Inicie o ambiente de desenvolvimento:
    ```bash
    npm run dev
    ```
    > 🔵 O cliente rodará geralmente em: `http://localhost:5173`

---

## 🎮 Como Usar

1.  Abra o navegador no endereço do Frontend (`http://localhost:5173`).
2.  Na área de texto, cole os links dos sites que deseja capturar (um URL por linha).
3.  Selecione o formato desejado (`PNG`, `WEBP` ou `PDF`).
4.  Clique em **"Processar Capturas"**.
5.  Aguarde a finalização.
6.  Suas imagens estarão disponíveis na pasta: `server/downloads/DD_MM/` (onde `DD_MM` é o dia e mês atual, ex: `10_02` para 10 de fevereiro).
7.  Você também pode clicar no botão "Abrir" ao lado de cada captura bem-sucedida para visualizar o arquivo diretamente no navegador.

---

## 💡 Dicas de Produtividade

### 📋 Capturando Múltiplas Páginas Rapidamente

Se você precisa capturar muitas páginas de uma só vez, use esta técnica:

1. **Abra todos os links** em abas separadas no Chrome
2. **Instale a extensão** [Export Tabs](https://chrome.google.com/webstore/detail/export-tabs/bkngefkjjigdelnfcbnnobhfmfpkjnhd)
3. **Clique na extensão** e copie todos os URLs
4. **Cole no PrintFullPage** e processe!

> [!TIP]
> Com a extensão Export Tabs, você pode copiar dezenas de URLs em segundos. Perfeito para capturar múltiplas páginas de documentação, artigos ou produtos.

---

## 📂 Onde os Arquivos São Salvos?

Os screenshots são salvos automaticamente em:

```
server/downloads/DD_MM/
```

**Exemplo:** Capturas do dia 10 de fevereiro ficam em `server/downloads/10_02/`

### ⏱️ Auto-Exclusão

> [!IMPORTANT]
> **Os arquivos são automaticamente deletados após 10 minutos** para economizar espaço no servidor.

- Tempo configurável via variável `RETENTION_MINUTES` no `.env`
- Ideal para ambientes de produção (Hostinger, VPS, etc.)
- Pastas vazias são removidas automaticamente

**Para alterar o tempo de retenção:**
```env
# server/.env
RETENTION_MINUTES=30  # Manter por 30 minutos (padrão: 10)
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Se você tiver uma ideia para melhorar a UI ou otimizar o Puppeteer:

1.  Faça um Fork do projeto.
2.  Crie uma Branch para sua Feature (`git checkout -b feature/Incrível`).
3.  Faça o Commit (`git commit -m 'Add some Incrível'`).
4.  Push para a Branch (`git push origin feature/Incrível`).
5.  Abra um Pull Request.

---

_Desenvolvido com 💜 e muito café._
