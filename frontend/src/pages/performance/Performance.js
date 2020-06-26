import 'tui-chart/dist/tui-chart.css';

import React, { useEffect, useState } from 'react';

import ChartQueryTime from '../../components/chart-query-time/ChartQueryTime';
import { firestore as db } from '../../config/firebase';

const Performance = () => {
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
            <ChartQueryTime docs={scores} />
        </>
    ) : null;
};
export default Performance;
