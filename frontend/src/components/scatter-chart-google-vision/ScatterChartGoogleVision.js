import {
    docToCombinedSimilarity,
    docToGoogleVisionConfidence,
    docToGoogleVisionConfidenceAndSimilarity
} from '../../utils/chart-utils';

import React from 'react';
import { ScatterChart } from '@toast-ui/react-chart';
import { uppercaseWord } from '../../utils/func-utils';

const toOptions = ({ ratingType, width, height, title }) => ({
    chart: {
        width,
        height,
        title
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

export const toData = ({ docs, ratingType, withSimilarity = false }) => {
    return {
        series: [
            {
                name: 'TF-IDF',
                data: docs.flatMap(
                    withSimilarity
                        ? docToGoogleVisionConfidenceAndSimilarity('tfIdf', ratingType)
                        : docToGoogleVisionConfidence('tfIdf', ratingType)
                )
            },
            {
                name: 'Doc2Vec',
                data: docs.flatMap(
                    withSimilarity
                        ? docToGoogleVisionConfidenceAndSimilarity('doc2vec', ratingType)
                        : docToGoogleVisionConfidence('doc2vec', ratingType)
                )
            },
            {
                name: 'Combined',
                data: docs.flatMap(docToCombinedSimilarity(ratingType))
            }
        ]
    };
};

const ScatterChartGoogleVision = props => <ScatterChart data={toData(props)} options={toOptions(props)} />;
export default ScatterChartGoogleVision;
