import { PieChart } from '@toast-ui/react-chart';
import React from 'react';
import { frequencies } from '../../utils/func-utils';
import { similarityToUserRatings } from '../../utils/chart-utils';

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

const toOptions = algorithmTitle => ({
    chart: {
        width: 500,
        height: 400,
        title: `${algorithmTitle} User ratings with 80 - 100 similarity scores`
    },
    series: {
        showLegend: true,
        labelAlign: 'center'
    }
});

export const toData = (similarityAlgorithm, scoresDocs) => {
    const ranges = [80, 90];
    const totalRatings = [];
    for (const range of ranges) {
        const rangeRatings = similarityToUserRatings(similarityAlgorithm, scoresDocs)[range];
        if (rangeRatings) {
            totalRatings.push(...rangeRatings);
        }
    }

    const series = Object.entries(frequencies(totalRatings)).map(([key, val]) => ({ name: key, data: val }));

    return {
        categories: ['80 - 100'],
        series
    };
};

const PieCategoryRatings = ({ algorithmTitle, docs, similarityAlgorithm }) => (
    <PieChart data={toData(similarityAlgorithm, docs)} options={toOptions(algorithmTitle)} />
);
export default PieCategoryRatings;
