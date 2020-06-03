import {
    DataDoc,
    addTfIdfVector,
    readJSON,
    writeJSON,
    toTerms,
    addDocVectors,
} from './utils/migrator';
import { createWriteStream, readFileSync, writeFileSync } from 'fs';
import express, { static as expressStatic } from 'express';
import { json, urlencoded } from 'body-parser';

import { Client } from '@elastic/elasticsearch';
import { classifyImage } from './classify';
import cors from 'cors';
import { join } from 'path';
import { makeUrl } from './utils/image-storage';
import multer from 'multer';

// const docsVectors = JSON.parse(
//     readFileSync('../data_proccessing/doc2vec/docVectors.json').toString()
// );
// console.log(docsVectors.map(vec => vec.length));
// const dataDocs: DataDoc[] = readJSON('../data.json');
// addDocVectors(dataDocs, docsVectors);
// const idToTerm = addTfIdfVector(dataDocs);
// writeJSON(dataDocs, 'new-data.json');

// console.log('dataDocs[0]', dataDocs[0]);
// console.log('idToTerm["0"]', idToTerm["0"]);
// console.log('idToTerm["0"]', idToTerm["1"]);

// const dictionary = readJSON('dictionary.json');
// console.log('dictionary[0] = ', dictionary[0])
// const idToTerm = makeIdToTerm(dictionary);
// console.log('idToTerm', idToTerm)
// const idfMap = toIdfMap(dataDocs);
// add_tfIdf_vectors(idToTerm, idfMap, dataDocs);
// console.log(JSON.stringify(data[0]))
// console.log('newDataDocs', dataDocs[0]);
// console.log('idToTerm[4]', idToTerm[4]);
// console.log('idfMap[leisur]', idfMap['leisure']);

// const dataDocs: DataDoc[] = readJSON('../data.json');
// const docsTokens: string[][] = dataDocs.map(dataDoc => {
//     return dataDoc._source.labelAnnotations.map(annotation => {
//         return annotation.description;
//     });
// });
// const doc2vecInputFile: string = docsTokens
//     .map(docTokens => docTokens.flatMap(toTerms).join(' '))
//     .join('\n');

// writeFileSync('doc2vecInputFile.txt', doc2vecInputFile);

// console.log(docsVectors);

const upload = multer({ dest: __dirname + '/uploads' });
const client = new Client({
    node: 'http://localhost:9200/',
});

const app = express();
const port = 3000;
const constPath = 'C:\\Users\\user\\Desktop\\images\\unsplash\\';

app.use(cors());
app.use(urlencoded({ extended: false }));
app.use(json());

app.use(expressStatic('static'));

app.post('/upload', upload.single('file'), (req, res) => {
    if ('file' in req) {
        // const imagePath = (req as { file: { path: string } }).file.path;
        const originalName = (req as { file: { originalname: string } }).file
            .originalname;
        client
            .search({
                index: 'labels',
                body: {
                    query: {
                        constant_score: {
                            filter: {
                                term: {
                                    image_path: originalName,
                                },
                            },
                        },
                    },
                },
            })
            .then(result => {
                console.log(
                    'result',
                    result.body.hits.hits[0]._source.tfIdf_vector
                );
                const tfIdf_vector =
                    result.body.hits.hits[0]._source.tfIdf_vector;
                client
                    .search({
                        index: 'labels',
                        size: 6,
                        body: {
                            query: {
                                function_score: {
                                    query: { match_all: {} },
                                    script_score: {
                                        script: {
                                            source:
                                                "cosineSimilaritySparse (params.query_vector, doc['tfIdf_vector']) + 1.0",
                                            params: {
                                                query_vector: tfIdf_vector,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    })
                    .then(result => {
                        console.log('result', result.body.hits.hits);

                        res.json({
                            elasticSearchResult: result,
                            imageDescriptions: ['descriptions'],
                        });
                        // res.send('' + JSON.stringify(result));
                    });
            })
            .catch(reason => console.log('error', reason));

        // classifyImage(imagePath).then(predictions => {
        //     if (predictions && predictions.length > 1) {
        //         const descriptions = predictions[0].className;
        //         console.log('searching for ', descriptions);
        //         client
        //             .search({
        //                 index: 'image_descriptions',
        //                 body: {
        //                     query: {
        //                         match: { descriptions },
        //                     },
        //                 },
        //             })
        //             .then(result => {
        //                 // console.log('result', result);
        //                 res.json({
        //                     elasticSearchResult: result,
        //                     imageDescriptions: descriptions,
        //                 });
        //                 // res.send('' + JSON.stringify(result));
        //             })
        //             .catch(reason => console.log('error', reason));
        //     }
        //     // console.log('predictions after', predictions);
        //     // res.json(predictions);
        // });
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
