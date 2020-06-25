import React from 'react';
import { ScatterChart } from '@toast-ui/react-chart';
import { docToGoogleVisionConfidence } from '../../utils/chart-utils';

const options = {
    chart: {
        width: 500,
        height: 400,
        title: ''
    },
    yAxis: {
        title: 'User Rating',
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
};

export const toData = scoresDocs => {
    return {
        series: [
            {
                name: 'TF-IDF',
                data: scoresDocs.flatMap(docToGoogleVisionConfidence('tfIdf'))
            },
            {
                name: 'Doc2Vec',
                data: scoresDocs.flatMap(docToGoogleVisionConfidence('doc2vec'))
            }
        ]
    };
};

const ScatterChartGoogleVision = ({ docs }) => <ScatterChart data={toData(docs)} options={options} />;
export default ScatterChartGoogleVision;
