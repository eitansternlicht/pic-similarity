import 'tui-chart/dist/tui-chart.css';

import React, { useEffect, useState } from 'react';

import ChartQueryTime from '../../components/chart-query-time/ChartQueryTime';
import { firestore as db } from '../../config/firebase';

const Performance = () => {
    const [scores, setScores] = useState(null);
    const [err, setErr] = useState(null);

    useEffect(() => {
        db.collection('scores')
            .get()
            .then(results => {
                if (results) {
                    const s = results.docs.map(d => d.data());
                    console.log('scoressss', s);
                    setScores(s);
                    setErr(null);
                } else {
                    setErr('Network Error');
                }
            });
    }, []);
    if (err == null) {
        return scores ? (
            <>
                <ChartQueryTime docs={scores} />
            </>
        ) : null;
    } else {
        return (
            <div
                className="raleway"
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                    paddingTop: 250
                }}
            >
                <h1>{err}</h1>
            </div>
        );
    }
};
export default Performance;
