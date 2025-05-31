# Formatador ABNT

Projeto full stack para formatação automática de documentos PDF e DOCX no padrão ABNT.

## Estrutura
- `client/` — Frontend React (Vite)
- `server/` — Backend Node.js (Express)

## Como rodar

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm create vite@latest -- --template react
npm install
npm run dev
```

Acesse o frontend em http://localhost:5173

## Funcionalidades
- Upload de arquivos PDF/DOCX
- Processamento e simulação de formatação ABNT
- Download do arquivo formatado
- UI moderna e responsiva 