import { average, mapValues, uppercaseWord } from '../../utils/func-utils';
import { categoriesByTen, similarityGroupsToUserRatings } from '../../utils/chart-utils';

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
//             name: 'Doc2Vec',
//             data: [2, 2, undefined, 4, 5, 6, 5, 8, 9, 4]
//         }
//     ]
// };

const toOptions = ({ ratingType, width, height }) => ({
    chart: {
        width,
        height,
        title: `${uppercaseWord(ratingType)} Average User Rating vs Similarity scores`
    },
    yAxis: {
        title: 'Average User Rating',
        min: 0,
        max: 10
    },
    xAxis: {
        title: 'Similarity score',
        min: 0,
        max: 10
    }
});


export const toData = ({docs, ratingType}) => {
    return {
        categories: Object.values(categoriesByTen).sort(),
        series: [
            {
                name: 'TF-IDF',
                data: Object.values({
                    ...mapValues(_ => undefined, categoriesByTen),
                    ...mapValues(
                        val => average(val).toFixed(1),
                        similarityGroupsToUserRatings('tfIdf', docs, ratingType)
                    )
                })
            },
            {
                name: 'Doc2Vec',
                data: Object.values({
                    ...mapValues(_ => undefined, categoriesByTen),
                    ...mapValues(
                        val => average(val).toFixed(1),
                        similarityGroupsToUserRatings('doc2vec', docs, ratingType)
                    )
                })
            }
        ]
    };
};

const ChartAverageRating = (props) => 
    (<ColumnChart data={toData(props)} options={toOptions(props)} />);

export default ChartAverageRating;
