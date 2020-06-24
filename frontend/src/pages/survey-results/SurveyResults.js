import 'tui-chart/dist/tui-chart.css';

import React, { useEffect, useState } from 'react';

import ChartAverageRating from '../../components/chart-average-rating/ChartAverageRating';
import PieCategoryRatings from '../../components/pie-category-ratings/PieCategoryRatings';
import ScatterChartGoogleVision from '../../components/scatter-chart-google-vision/ScatterChartGoogleVision';
import { average } from '../../utils/func-utils';
import firebase from '../../config/firebase';

const db = firebase.firestore();

const SurveyResults = () => {
    const [scores, setScores] = useState(null);

    useEffect(() => {
        db.collection('scores')
            .get()
            .then(results => {
                const s = results.docs.map(d => d.data());
                console.log('scoressss', s);
                setScores(s);
            });
    }, []);
    return scores ? (
        <>
            <div>Number of surveys: {scores.length}</div>
            <div>
                {'TF-IDF average user rating: ' +
                    average(scores.flatMap(score => score.tfIdf.results.map(res => res.userRating.rating))).toFixed(1)}
            </div>
            <div>
                {'Doc2Vec average user rating: ' +
                    average(scores.flatMap(score => score.doc2vec.results.map(res => res.userRating.rating))).toFixed(
                        1
                    )}
            </div>
            <ScatterChartGoogleVision docs={scores} />
            <ChartAverageRating docs={scores} />
            <div>
                <PieCategoryRatings docs={scores} similarityAlgorithm="tfIdf" algorithmTitle="TF-IDF" />
                <PieCategoryRatings docs={scores} similarityAlgorithm="doc2vec" algorithmTitle="Doc2Vec" />
            </div>
        </>
    ) : null;
};
export default SurveyResults;
