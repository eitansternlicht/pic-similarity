import express, { static as expressStatic } from 'express';
import { json, urlencoded } from 'body-parser';

import axios from 'axios';
import cors from 'cors';
import { generateRandomImagePath } from './db/image-paths';
import { labelAnnotationsToTerms } from './db/migrator';
import multer from 'multer';
import { queryElastic } from './db/elastic';
import { runPerformanceTests } from './performace-tests';

// runPerformanceTests();

const PORT = 3000;

const App = express();
App.use(cors());
App.use(urlencoded({ extended: false }));
App.use(json());
App.use(expressStatic('static'));

App.post('/upload', multer({ dest: __dirname + '/uploads' }).single('file'), ({ file: { originalname } }, response) =>
    queryElastic(originalname).then(results => response.json(results))
);

App.get('/random', (_, response) =>
    queryElastic(generateRandomImagePath()).then(
        results => response.json(results),
        error => console.log(error)
    )
);

App.post('/query-annotations', (req, response) => {
    const terms = labelAnnotationsToTerms(req.body);
    axios.post('http://localhost:8000', terms).then(res => console.log('RESULT', res.data));
});

// labelAnnotationsToTerms

App.listen(PORT, () => {
    console.log(`Pic Similarity Serive listening on PORT ${PORT}!`);
});
