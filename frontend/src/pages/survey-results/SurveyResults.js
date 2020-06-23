import React, { useState } from 'react';

import firebase from '../../config/firebase';

const db = firebase.firestore();

const SurveyResults = () => {
    const [scores, setScores] = useState(null);
    db.collection('scores')
        .get()
        .then(results => {
            const scores = results.docs.map(d => d.data());
            console.log(scores);
        });
    return <div>scores</div>;
};
export default SurveyResults;
