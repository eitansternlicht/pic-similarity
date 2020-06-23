import express, { static as expressStatic } from 'express';
import { json, urlencoded } from 'body-parser';

import cors from 'cors';
import { generateRandomImagePath } from './db/image-paths';
import multer from 'multer';
import { queryElastic } from './db/elastic';

const PORT = 3000;

const App = express();
App.use(cors());
App.use(urlencoded({ extended: false }));
App.use(json());
App.use(expressStatic('static'));

App.post('/upload', multer({ dest: __dirname + '/uploads' }).single('file'), ({ file: { originalname } }, response) =>
    queryElastic(originalname).then(results => response.json(results))
);

App.get('/random', (_, response) => queryElastic(generateRandomImagePath()).then(results => response.json(results)));

App.listen(PORT, () => {
    console.log(`Pic Similarity Serive listening on PORT ${PORT}!`);
});
