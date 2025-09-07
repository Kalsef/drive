import express from 'express';
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Em vez de ler o arquivo:
const keyFileContent = process.env.SERVICE_ACCOUNT_JSON;
const credentials = JSON.parse(keyFileContent);

const app = express();
const PORT = 3000;

const KEYFILEPATH = path.join(__dirname, 'service-account.json');

// Escopos de acesso
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

// Autenticação
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

// ID da pasta que você quer listar
const FOLDER_ID = '1SVDVg6_hG9Jd2ogNdy9jC4RkIglbEeAu';

app.get('/arquivos', async (req, res) => {
  try {
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType)',
      pageSize: 100,
    });

    const files = response.data.files.map(file => ({
      name: file.name,
      link: `https://drive.google.com/uc?export=view&id=${file.id}`,
    }));

    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao listar arquivos');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

