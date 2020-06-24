import { average, mapValues } from '../../utils/func-utils';
import { categoriesByTen, similarityToUserRatings } from '../../utils/chart-utils';

import { LineChart } from '@toast-ui/react-chart';
import React from 'react';

// const data = {
//     categories: Object.values(categories).sort(),
//     series: [
//         {
//             name: 'TF-IDF',
//             data: [2, 2, 3, 4, 5, 6, 7, 8, 9, 7]
//         },
//         {
//             name: 'Doc2Vec',
//             data: [2, 2, undefined, 4, 5, 6, 5, 8, 9, 4]
//         }
//     ]
// };

const options = {
    chart: {
        width: 800,
        height: 450,
        title: 'Query time per algorithm'
    },
    yAxis: {
        title: 'Query time in ms'
    },
    xAxis: {
        title: ''
    }
};

export const toData = scoresDocs => {
    return {
        series: [
            {
                name: 'TF-IDF',
                data: scoresDocs.map((doc, i) => [i + 1, doc.tfIdf.queryTime])
            },
            {
                name: 'Doc2Vec',
                data: scoresDocs.map((doc, i) => [i + 1, doc.doc2vec.queryTime])
            }
        ]
    };
};

const ChartQueryTime = ({ docs }) => <LineChart data={toData(docs)} options={options} />;
export default ChartQueryTime;
