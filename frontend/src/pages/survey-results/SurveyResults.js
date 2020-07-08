import 'tui-chart/dist/tui-chart.css';

import React, { useEffect, useState } from 'react';

import ChartAverageRating from '../../components/chart-average-rating/ChartAverageRating';
import Loader from 'react-loader-spinner';
import PieCategoryRatings from '../../components/pie-category-ratings/PieCategoryRatings';
import RangeSlider from '../../components/range-slider/RangeSlider';
import ScatterChart from '../../components/scatter-chart/ScatterChart';
import { average } from '../../utils/func-utils';
import { firestore as db } from '../../config/firebase';

const SurveyResults = () => {
    const [scores, setScores] = useState(null);
    const [tfIdfRange, setTfIdfRange] = useState([80, 100]);
    const [doc2vecRange, setDoc2vecRange] = useState([80, 100]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        db.collection('scores')
            .get()
            .then(results => {
                setScores(results.docs.map(doc => doc.data()));
                setLoading(false);
            });
    }, []);
    return loading ? (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                marginTop: 150
            }}
        >
            <Loader type="Puff" color="#57737A" height={160} width={160} />
            <div className="raleway" style={{ color: '#57737A', marginTop: 20, fontSize: 30 }}>
                Loading all survey results...
            </div>
        </div>
    ) : (
        <div style={{ padding: 20 }}>
            <div>Number of surveys: {scores.length}</div>
            <div>
                {'TF-IDF average user rating: ' +
                    average(
                        scores.flatMap(score =>
                            score.tfIdf.results.map(res => average(Object.values(res.userRating.ratings)))
                        )
                    ).toFixed(1)}
            </div>
            <div>
                {'Doc2Vec average user rating: ' +
                    average(
                        scores.flatMap(score =>
                            score.doc2vec.results.map(res => average(Object.values(res.userRating.ratings)))
                        )
                    ).toFixed(1)}
            </div>

            <ScatterChart
                docs={scores}
                withSimilarity
                withCombined
                scoreName="Similarity Score + Google Vision Confidence"
            />
            <ScatterChart docs={scores} scoreName="Google Vision Confidence" />
            <div style={{ display: 'flex', flexDirection: 'row', margin: '20px 0' }}>
                <div style={{ marginRight: 20 }}>
                    <ScatterChart docs={scores} ratingType="objects" scoreName="Google Vision Confidence" />
                </div>
                <div style={{ marginRight: 20 }}>
                    <ScatterChart docs={scores} ratingType="background" scoreName="Google Vision Confidence" />
                </div>
                <div>
                    <ScatterChart docs={scores} ratingType="scenario" scoreName="Google Vision Confidence" />
                </div>
            </div>
            <ChartAverageRating docs={scores} />
            <div style={{ display: 'flex', flexDirection: 'row', margin: '20px 0' }}>
                <div style={{ marginRight: 20 }}>
                    <ChartAverageRating docs={scores} ratingType="objects" />
                </div>
                <div style={{ marginRight: 20 }}>
                    <ChartAverageRating docs={scores} ratingType="background" />
                </div>
                <div>
                    <ChartAverageRating docs={scores} ratingType="scenario" />
                </div>
            </div>
            <ScatterChart docs={scores} scoreName="Similarity Score" onlySimilarity withCombined />

            <div style={{ display: 'flex', flexDirection: 'row', margin: 20 }}>
                <div style={{ marginRight: 50 }}>
                    <RangeSlider range={tfIdfRange} setRange={setTfIdfRange} similarityAlgorithm="TF-IDF" />

                    <PieCategoryRatings
                        range={tfIdfRange}
                        docs={scores}
                        similarityAlgorithm="tfIdf"
                        algorithmTitle="TF-IDF"
                    />
                </div>
                <div>
                    <RangeSlider range={doc2vecRange} setRange={setDoc2vecRange} similarityAlgorithm="Doc2Vec" />

                    <PieCategoryRatings
                        range={doc2vecRange}
                        docs={scores}
                        similarityAlgorithm="doc2vec"
                        algorithmTitle="Doc2Vec"
                    />
                </div>
            </div>
        </div>
    );
};
export default SurveyResults;
