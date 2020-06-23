import 'tui-chart/dist/tui-chart.css';

import React, { useEffect, useState } from 'react';

import ChartAverageRating from '../../components/chart-average-rating/ChartAverageRating';
import firebase from '../../config/firebase';

const db = firebase.firestore();

const SurveyResults = () => {
    const [scores, setScores] = useState(null);

    useEffect(() => {
        db.collection('scores')
            .get()
            .then(results => {
                console.log('here');
                setScores(results.docs.map(d => d.data()));
            });
    }, []);

    return <div>{scores ? <ChartAverageRating docs={scores} /> : null}</div>;
};
export default SurveyResults;
