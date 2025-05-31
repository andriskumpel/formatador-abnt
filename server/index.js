const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Configuração do Multer para upload em memória
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Tipo de arquivo não suportado'));
  },
});

// Endpoint de upload
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Arquivo não enviado' });
  }

  // Simular processamento (mock)
  // Aqui você pode chamar um script real de formatação ABNT
  // Por enquanto, só devolve o mesmo arquivo com nome alterado
  const ext = path.extname(req.file.originalname);
  const filename = path.basename(req.file.originalname, ext) + '-abnt' + ext;

  // Simular tempo de processamento
  setTimeout(() => {
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', req.file.mimetype);
    res.send(req.file.buffer);
  }, 2000);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
}); 