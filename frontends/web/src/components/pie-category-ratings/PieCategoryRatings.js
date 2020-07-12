import { PieChart } from '@toast-ui/react-chart';
import React from 'react';
import { frequencies } from '../../utils/func-utils';
import { similarityGroupsToUserRatings } from '../../utils/chart-utils';

const toOptions = algorithmTitle => ({
    chart: {
        width: 500,
        height: 400,
        title: `${algorithmTitle} User ratings with similarity scores`
    },
    series: {
        showLegend: true,
        labelAlign: 'center'
    }
});

export const toData = (similarityAlgorithm, scoresDocs, range) => {
    const totalRatings = [];
    for (let i = range[0]; i < range[1]; i += 10) {
        const rangeRatings = similarityGroupsToUserRatings(similarityAlgorithm, scoresDocs)[i];
        if (rangeRatings) {
            totalRatings.push(...rangeRatings);
        }
    }

    const series = Object.entries(frequencies(totalRatings)).map(([key, val]) => ({ name: key, data: val }));
    return {
        series
    };
};

const PieCategoryRatings = ({ algorithmTitle, docs, similarityAlgorithm, range }) => (
    <PieChart data={toData(similarityAlgorithm, docs, range)} options={toOptions(algorithmTitle)} />
);
export default PieCategoryRatings;
