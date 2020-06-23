import { average, mapValues } from '../../utils/func-utils';
import { categoriesByTen, similarityToUserRatings } from '../../utils/chart-utils';

import { ColumnChart } from '@toast-ui/react-chart';
import React from 'react';

// const data = {
//     categories: Object.values(categories).sort(),
//     series: [
//         {
//             name: 'TF-IDF',
//             data: [2, 2, 3, 4, 5, 6, 7, 8, 9, 7]
//         },
//         {
//             name: 'Word2Vec',
//             data: [2, 2, undefined, 4, 5, 6, 5, 8, 9, 4]
//         }
//     ]
// };

const options = {
    chart: {
        width: 800,
        height: 450,
        title: 'User Ratings vs Similarity scores'
    },
    yAxis: {
        title: 'Average User Ratings',
        min: 0,
        max: 10
    },
    xAxis: {
        title: 'Similarity score',
        min: 0,
        max: 10
    },
    series: {
        // showLabel: true
    }
};

export const toData = scoresDocs => {
    const res = similarityToUserRatings('tfIdf', scoresDocs);
    const resWithAverage = mapValues(average, res);
    const r = Object.values({ ...mapValues(_ => undefined, categoriesByTen), ...resWithAverage });
    // return data;
    return {
        categories: Object.values(categoriesByTen).sort(),
        series: [
            {
                name: 'TF-IDF',
                data: r
            },
            {
                name: 'Word2Vec',
                data: [2, 2, 3, 4, 5, 6, 5, 8, 9, 4]
            }
        ]
    };
};

const ChartAverageRating = ({ docs }) => <ColumnChart data={toData(docs)} options={options} />;
export default ChartAverageRating;
