import {
    docToCombinedSimilarity,
    docToGoogleVisionConfidence,
    docToGoogleVisionConfidenceAndSimilarity,
    similarityToUserRatings
} from '../../utils/chart-utils';

import React from 'react';
import { ScatterChart as ReactScatterChart } from '@toast-ui/react-chart';
import { correlation } from '../../utils/pearson-correlation';
import { uppercaseWord } from '../../utils/func-utils';
import { Spring } from 'react-spring/renderprops';

const toOptions = ({ ratingType, scoreName, title, width, height }) => ({
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
        title: `${scoreName}`,
        min: 0,
        max: 100
    },
    series: {
        showLegend: true,
        labelAlign: 'center'
    }
});

export const toData = ({ docs, ratingType, withSimilarity = false, onlySimilarity = false, withCombined = false }) => {
    // console.log('bla', similarityToUserRatings('tfIdf', docs, ratingType));
    // return {
    const series = [
        {
            name: 'TF-IDF',
            data: onlySimilarity
                ? similarityToUserRatings('tfIdf', docs, ratingType)
                : docs.flatMap(
                      withSimilarity
                          ? docToGoogleVisionConfidenceAndSimilarity('tfIdf', ratingType)
                          : docToGoogleVisionConfidence('tfIdf', ratingType)
                  )
        },
        {
            name: 'Doc2Vec',
            data: onlySimilarity
                ? similarityToUserRatings('doc2vec', docs, ratingType)
                : docs.flatMap(
                      withSimilarity
                          ? docToGoogleVisionConfidenceAndSimilarity('doc2vec', ratingType)
                          : docToGoogleVisionConfidence('doc2vec', ratingType)
                  )
        }
    ];
    if (withCombined) {
        series.push({
            name: 'Combined',
            data: docs.flatMap(docToCombinedSimilarity(ratingType))
        });
    }
    return { series };
    // };
};
const toCorrelation = data => {
    const xs = data.map(({ x }) => Number.parseFloat(x));
    const ys = data.map(({ y }) => Number.parseFloat(y));
    return correlation.pearson(xs, ys);
};

const ScatterChart = props => {
    const data = toData(props);
    const correlationData = data.series.map(({ name, data }) => [name, toCorrelation(data).toFixed(3)]);
    return (
        <div>
            <div style={{ flexDirection: 'row', display: 'flex', justifyContent: 'space-evenly' }}>
                <ReactScatterChart data={data} options={toOptions(props)} />
            </div>
            <div
                style={{
                    flexDirection: 'row',
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    paddingTop: 50
                }}
            >
                {correlationData.map(([algorithm, correlationScore]) => (
                    <div
                        key={algorithm}
                        style={{ alignItems: 'center', color: '#E6E8EF', paddingLeft: 30, paddingRight: 30 }}
                    >
                        <h3>
                            <div
                                style={{
                                    flexDirection: 'row',
                                    display: 'flex',
                                    justifyContent: 'space-evenly'
                                }}
                            >
                                <Spring
                                    config={{ friction: 100, precision: 0.1 }}
                                    from={{ number: -1 }}
                                    to={{ number: correlationScore }}
                                >
                                    {props => <div>{props.number.toFixed(3)}</div>}
                                </Spring>
                            </div>
                            {algorithm} Correlation
                        </h3>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default ScatterChart;
