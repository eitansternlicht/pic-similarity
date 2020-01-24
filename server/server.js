const express = require('express');
const cors = require('cors');
const { urlencoded, json } = require('body-parser');
const { Client } = require('@elastic/elasticsearch');
const multer = require('multer');
const tensorflowResults = require('./tensorflow-results.json');
const { writeFileSync, readFileSync } = require('fs');
const upload = multer({ dest: __dirname + '/uploads' });
const {
    imageClassification,
    imagesClassification,
    toESjson,
} = require('./classify');
const client = new Client({
    node: 'http://localhost:9200/',
});

const app = express();
const port = 3000;

app.use(cors());
app.use(urlencoded({ extended: false }));
app.use(json());
// app.use(express.static('public'));

app.post('/upload', upload.single('file'), (req, res) => {
    console.log('fule', req.file);
    if (req.file) {
        res.json(req.file);
    } else throw 'error';
});

app.post('/search', (req, res) => {
    // toESjson("results.json");
    // imagesClassification('/Users/roisulimani/Desktop/corpus');
    // console.log('req descriptions', req.body.data.descriptions);
    const { pic } = req.body.data;

    if (pic) {
        console.log(pic);
    } else {
        console.log('kchbvscjhbsv');

        return;
        const { descriptions } = req.body.data;

        client
            .search({
                index: 'mock_descriptions',
                body: {
                    query: {
                        match: { descriptions },
                    },
                },
            })
            .then(result => {
                // console.log('res', result);
                res.send({ descriptions: result });
            })
            .catch(error => {
                // console.log('error', error);
                res.send({ error: error });
            });
    }
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
    const fileBuffer = readFileSync('tensorflow-results-naive.json');
    const oldJSON = JSON.parse(fileBuffer);
    const newJSON = oldJSON.map(imageObj => {
        return {
            _index: 'image_descriptions',
            _type: '_doc',
            _id: imageObj.filename,
            _score: 1,
            _source: imageObj,
        };
    });

    writeFileSync(
        'tensorflow-results-naive2.json',
        newJSON.map(JSON.stringify).join('')
    );
};

// bla();
// {
//     'ypn4xZH3lNM.jpg': [
//         { className: 'hourglass', probability: 0.2572644352912903 },
//         { className: 'packet', probability: 0.2121710330247879 },
//         {
//             className: 'book jacket, dust cover, dust jacket, dust wrapper',
//             probability: 0.0948827862739563
//         }
//     ]
// }

// [
//     {
//         filename: 'sdflkadsjf.jpg',
//         descriptions: 'ocean,blue,sky',
//     },
//     {
//         filename: 'sdflkadsjf2.jpg',
//         descriptions: 'ocean,blue,sky',
//     },
// ];
