const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Client } = require('@elastic/elasticsearch');
const { imageClassification, imagesClassification, toESjson } = require('./classify');
const client = new Client({
    node: 'http://localhost:9200/'
});

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.post('/search', (req, res) => {
    
    toESjson("results.json");
    // imagesClassification('/Users/roisulimani/Desktop/corpus');
    // console.log('req descriptions', req.body.data.descriptions);
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
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});
