import { DataDoc, initTfIdfData, labelAnnotationsToTerms, readJSON, tf_to_tfIdf } from './db/migrator';
import express, { static as expressStatic } from 'express';
import { json, urlencoded } from 'body-parser';
import { queryElastic, queryElasticByVectors } from './db/elastic';

import axios from 'axios';
import cors from 'cors';
import { frequencies } from './utils/func-utils';
import { generateRandomImagePath } from './db/image-paths';
import multer from 'multer';
import { runPerformanceTests } from './performace-tests';

// runPerformanceTests();
const { termToId, termToIdf } = initTfIdfData(readJSON('db/docs.esdata'));

// console.log('termToId', termToId);
// console.log('termToIdf', termToIdf);

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
    Promise.all([
        axios.post('http://localhost:8000', terms),
        Promise.resolve().then(() => {
            const freqs = frequencies(terms);
            const tf_vector = Object.fromEntries(
                Object.entries(freqs).map(([term, freq]) => [term, freq / terms.length])
            );
            const termToTfIdf = tf_to_tfIdf(termToIdf, tf_vector);
            const sparseVecTfIdf = Object.fromEntries(
                Object.entries(termToTfIdf).map(([term, tfIdf]) => [termToId[term], tfIdf])
            );
            return sparseVecTfIdf;
        })
    ]).then(([doc2vecVectorResults, tfIdfVector]) => {
        const doc2vecVector = doc2vecVectorResults.data;
        console.log('{ tfIdfVector, doc2vecVector }', { tfIdfVector, doc2vecVector });
        queryElasticByVectors({ tfIdfVector, doc2vecVector }).then(res => {
            response.json(res);
        });
    });
});

App.listen(PORT, () => {
    console.log(`Pic Similarity Serive listening on PORT ${PORT}!`);
});
