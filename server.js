const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3002;

// Garantir que a pasta public/imagem e public/uploads existam
const imagemDir = path.join(__dirname, 'public', 'imagem');
const uploadDir = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(imagemDir)){
    fs.mkdirSync(imagemDir, { recursive: true });
}
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do Multer para receber arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Se for logo, salva na pasta 'imagem', se for foto do PC, salva em 'uploads'
    if (file.fieldname === 'logoFrente' || file.fieldname === 'logoVerso') {
      cb(null, imagemDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    if (file.fieldname === 'logoFrente') {
      cb(null, 'logo-frente' + path.extname(file.originalname));
    } else if (file.fieldname === 'logoVerso') {
      cb(null, 'logo-verso' + path.extname(file.originalname));
    } else {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  }
});
const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rota para upload e salvamento de imagens
app.post('/upload', upload.fields([
  { name: 'logoFrente', maxCount: 1 },
  { name: 'logoVerso', maxCount: 1 },
  { name: 'fotoPc', maxCount: 1 }
]), (req, res) => {
  const filesPath = {};
  if (req.files['logoFrente']) filesPath.logoFrente = `/imagem/${req.files['logoFrente'][0].filename}`;
  if (req.files['logoVerso']) filesPath.logoVerso = `/imagem/${req.files['logoVerso'][0].filename}`;
  if (req.files['fotoPc']) filesPath.fotoPc = `/uploads/${req.files['fotoPc'][0].filename}`;
  
  res.json(filesPath);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
