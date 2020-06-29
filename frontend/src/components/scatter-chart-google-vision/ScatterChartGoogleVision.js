import React from 'react';
import { ScatterChart } from '@toast-ui/react-chart';
import { docToGoogleVisionConfidence } from '../../utils/chart-utils';
import { uppercaseWord } from '../../utils/func-utils';
const toOptions = ratingType => ({
    chart: {
        width: 500,
        height: 400,
        title: ''
    },
    yAxis: {
        title: `${uppercaseWord(ratingType)} User Rating`,
        min: 0,
        max: 10
    },
    xAxis: {
        title: 'Google Vision Confidence',
        min: 0,
        max: 100
    },
    series: {
        showLegend: true,
        labelAlign: 'center'
    }
});

export const toData = (scoresDocs, ratingType) => {
    return {
        series: [
            {
                name: 'TF-IDF',
                data: scoresDocs.flatMap(docToGoogleVisionConfidence('tfIdf', ratingType))
            },
            {
                name: 'Doc2Vec',
                data: scoresDocs.flatMap(docToGoogleVisionConfidence('doc2vec', ratingType))
            }
        ]
    };
};

const ScatterChartGoogleVision = ({ docs, ratingType }) => (
    <ScatterChart data={toData(docs, ratingType)} options={toOptions(ratingType)} />
);
export default ScatterChartGoogleVision;
