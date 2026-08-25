import 'dotenv/config';
import path from 'path';
import express from 'express';

import router from './roles/routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/roles', router);

export default app;
