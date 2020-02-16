import { createWriteStream, readFileSync, writeFileSync } from 'fs';
import express, { static as expressStatic } from 'express';
import { json, urlencoded } from 'body-parser';

import { Client } from '@elastic/elasticsearch';
import { classifyImage } from './classify';
import cors from 'cors';
import { join } from 'path';
import { makeUrl } from './utils/image-storage';
import multer from 'multer';

const upload = multer({ dest: __dirname + '/uploads' });
const client = new Client({
    node: 'http://localhost:9200/',
});

const app = express();
const port = 3000;

app.use(cors());
app.use(urlencoded({ extended: false }));
app.use(json());

app.use(expressStatic('static'));

app.post('/upload', upload.single('file'), (req, res) => {
    if ('file' in req) {
        const imagePath = (req as { file: { path: string } }).file.path;
        classifyImage(imagePath).then(predictions => {
            if (predictions && predictions.length > 1) {
                const descriptions = predictions[0].className;
                console.log('searching for ', descriptions);
                client
                    .search({
                        index: 'image_descriptions',
                        body: {
                            query: {
                                match: { descriptions },
                            },
                        },
                    })
                    .then(result => {
                        // console.log('result', result);
                        res.json({
                            elasticSearchResult: result,
                            imageDescriptions: descriptions,
                        });
                        // res.send('' + JSON.stringify(result));
                    })
                    .catch(reason => console.log('error', reason));
            }
            // console.log('predictions after', predictions);
            // res.json(predictions);
        });
    } else throw new Error('error');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});

const bla = () => {
    // console.log('results', tensorflowResults);
    // const b = Object.keys(tensorflowResults).map(filename => ({
    //     filename,
    //     descriptions: tensorflowResults[filename][0].className
    //         .split(', ')
    //         .join(','),
    // }));
    // const s = JSON.stringify(b);
    // const fileBuffer = readFileSync('tensorflow-results-naive.json');
    // const oldJSON = JSON.parse(fileBuffer);
    // const newJSON = oldJSON.map(imageObj => {
    //     return {
    //         _index: 'image_descriptions',
    //         _type: '_doc',
    //         _id: imageObj.filename,
    //         _score: 1,
    //         _source: imageObj,
    //     };
    // });
    // writeFileSync(
    //     'tensorflow-results-naive2.json',
    //     newJSON.map(JSON.stringify).join('')
    // );
};
