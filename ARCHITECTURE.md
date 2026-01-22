# 🏛️ SCRAPER PRO - Arquitetura & Engenharia

## 🌟 O Pitch (Como vender este código)
"Este não é apenas um script de automação; é uma **API Enterprise-Grade** projetada para escalabilidade e manutenção. Diferente da versão anterior (monolítica), esta nova arquitetura desacopla a lógica de navegação da interface HTTP, permitindo que a aplicação cresça, receba novos recursos (como filas, novos motores de scrap, ou autenticação) sem quebrar o núcleo do sistema."

## 🏗️ Clean Architecture (O Segredo Técnico)

O sistema segue rigorosamente o princípio de separação de responsabilidades (SoC).

### 1. Controllers (`src/controllers`)
**"O Recepcionista"**
- **Responsabilidade:** Apenas recebe o pedido HTTP e valida os dados.
- **Nuance:** Não sabe o que é Puppeteer. Se trocarmos o Puppeteer por Selenium amanhã, este arquivo NÃO muda.
- **Segurança:** Implementa *Guard Clauses* para impedir que dados ruins cheguem ao core.

### 2. Services (`src/services`)
**"O Gerente"**
- **Responsabilidade:** Orquestra a operação. Decide onde salvar, chama a equipe de limpeza (Utils), e gerencia o ciclo de vida.
- **Nuance:** Implementa *Graceful Shutdown*. Se um erro fatal ocorrer, ele garante que o navegador feche para não "vazar" memória RAM no servidor.
- **Resiliência:** Processa links em loop isolado (`try/catch` dentro do `for`). Se um link falhar, os outros continuam.

### 3. Providers (`src/providers`)
**"O Especialista"**
- **Responsabilidade:** Sabe falar a língua do browser.
- **Nuance (Gentle Cleaner):** Possui uma inteligência isolada (`applyGentleCleaner`) que varre o DOM buscando botões de "Aceitar/18+" e clica neles cirurgicamente, sem injetar CSS ou quebrar o layout original.
- **Anti-Detecção:** Usa headers reais de User-Agent e viewport desktop para enganar firewalls simples.

### 4. Utils (`src/utils`)
**"As Ferramentas"**
- Funções puras e testáveis.
- `sanitizeFilename`: Garante que ninguém tente hackear o sistema salvando arquivos com nomes maliciosos (ex: `../../virus.exe`).

## 🚀 Como Testar e Rodar

### Instalação (Setup)
Apenas uma vez:
```bash
cd server
npm install
```

### Rodando em Desenvolvimento
Para ver logs em tempo real e reiniciar automaticamente ao salvar arquivos:
```bash
npm run dev
```

### Rodando em Produção (Performance Máxima)
Compila o TypeScript para JavaScript puro e otimizado:
```bash
npm run build
npm start
```

## 🧪 Como Validar a Captura
Envie um POST para `http://localhost:3001/print` com o JSON:
```json
{
  "links": ["https://www.uol.com.br", "https://stackoverflow.com"],
  "format": "webp"
}
```
O sistema retornará URLs públicas para download das imagens capturadas.
