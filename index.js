import express from 'express';
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';


const keyFileContent = process.env.SERVICE_ACCOUNT_JSON;
const credentials = JSON.parse(keyFileContent);

const app = express();
const PORT = 3000;

const KEYFILEPATH = path.join(__dirname, 'service-account.json');


const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];


const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });


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


