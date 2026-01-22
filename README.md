# 📸 PrintFullPage - Capturador Web Fullstack

> Uma aplicação moderna para capturar screenshots de páginas inteiras com precisão e estilo.

![Status do Projeto](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow)
![Node Version](https://img.shields.io/badge/Node.js-v18%2B-green?logo=node.js)
![React](https://img.shields.io/badge/Frontend-React_TS-blue?logo=react)

## 🎯 O que ele faz?

O **PrintFullPage** resolve o problema de tirar "prints" de sites longos. Ele utiliza automação de navegador para rolar a página inteira e capturar cada pixel, desde o cabeçalho até o rodapé, salvando o resultado localmente em alta resolução.

Tudo isso envolto em uma interface **"Vibe Tech" (Cyberpunk)** com fundos animados e efeitos de *glassmorphism*.

## 🚀 Funcionalidades Principais

* 📜 **Captura Full Page:** Rola automaticamente a página para garantir que o conteúdo dinâmico (lazy loading) seja carregado antes do print.
* 🎨 **Múltiplos Formatos:** Escolha entre `.png` (alta qualidade), `.webp` (web otimizado) ou `.pdf` (documento).
* ⚡ **Processamento em Lote:** Cole múltiplos links (um por linha) e deixe o sistema processar todos em sequência.
* 💾 **Armazenamento Local:** As capturas são salvas automaticamente e organizadas na pasta do servidor.

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

## 💻 Como Rodar o Projeto

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

### 🐢 Modo Manual (Opcional)

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
6.  Suas imagens estarão disponíveis na pasta: `server/downloads/PRINTEDPAGES`.

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