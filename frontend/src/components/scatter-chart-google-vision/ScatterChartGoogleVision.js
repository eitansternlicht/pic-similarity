import React from 'react';
import { ScatterChart } from '@toast-ui/react-chart';
import { docToGoogleVisionConfidence } from '../../utils/chart-utils';
import { frequencies } from '../../utils/func-utils';

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
const data = {
    series: [
        {
            name: 'TF-IDF',
            data: [
                { x: 74, y: 5.6 },
                { x: 75.3, y: 1.8 },
                { x: 93.5, y: 8.7 }
            ]
        },
        {
            name: 'Doc2Vec',
            data: [
                { x: 27, y: 5.6 },
                { x: 30.3, y: 3.8 },
                { x: 50.5, y: 5.7 }
            ]
        }
    ]
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
