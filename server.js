const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();

// Na Vercel, o único diretório com permissão de escrita é o /tmp
const uploadDir = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(__dirname, 'public', 'uploads');
const imagemDir = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(__dirname, 'public', 'imagem');

if (!fs.existsSync(imagemDir)){
    fs.mkdirSync(imagemDir, { recursive: true });
}
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'logoFrente' || file.fieldname === 'logoVerso') {
      cb(null, imagemDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    if (file.fieldname === 'logoFrente') {
      cb(null, 'logo-frente-' + Date.now() + path.extname(file.originalname));
    } else if (file.fieldname === 'logoVerso') {
      cb(null, 'logo-verso-' + Date.now() + path.extname(file.originalname));
    } else {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  }
});
const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rota para upload
app.post('/upload', upload.fields([
  { name: 'logoFrente', maxCount: 1 },
  { name: 'logoVerso', maxCount: 1 },
  { name: 'fotoPc', maxCount: 1 }
]), (req, res) => {
  const filesPath = {};
  if (req.files && req.files['logoFrente']) filesPath.logoFrente = `/imagem/${req.files['logoFrente'][0].filename}`;
  if (req.files && req.files['logoVerso']) filesPath.logoVerso = `/imagem/${req.files['logoVerso'][0].filename}`;
  if (req.files && req.files['fotoPc']) filesPath.fotoPc = `/uploads/${req.files['fotoPc'][0].filename}`;
  
  res.json(filesPath);
});

// Para rodar localmente com `node server.js`
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

// Exportação obrigatória para a Vercel
module.exports = app;
