import 'tui-chart/dist/tui-chart.css';

import React, { useEffect, useState } from 'react';

import ChartAverageRating from '../../components/chart-average-rating/ChartAverageRating';
import ChartQueryTime from '../../components/chart-query-time/ChartQueryTime';
import PieCategoryRatings from '../../components/pie-category-ratings/PieCategoryRatings';
import RangeSlider from '../../components/range-slider/RangeSlider';
import ScatterChartGoogleVision from '../../components/scatter-chart-google-vision/ScatterChartGoogleVision';
import { average } from '../../utils/func-utils';
import firebase from '../../config/firebase';

const db = firebase.firestore();

const Performance = () => {
    const [scores, setScores] = useState(null);
    const [tfIdfRange, setTfIdfRange] = useState([80, 100]);
    const [doc2vecRange, setDoc2vecRange] = useState([80, 100]);

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
            <ChartQueryTime docs={scores} />
        </>
    ) : null;
};
export default Performance;
