import 'tui-chart/dist/tui-chart.css';

import React, { useEffect, useState } from 'react';

import ChartAverageRating from '../../components/chart-average-rating/ChartAverageRating';
import Fade from 'react-reveal/Fade';
import Loader from 'react-loader-spinner';
import PieCategoryRatings from '../../components/pie-category-ratings/PieCategoryRatings';
import RangeSlider from '../../components/range-slider/RangeSlider';
import ScatterChart from '../../components/scatter-chart/ScatterChart';
import { Spring } from 'react-spring/renderprops';
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
        <div className="raleway">
            <Fade bottom>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-evenly',
                        paddingTop: 70,
                        paddingBottom: 50
                    }}
                >
                    <h3 style={{ fontSize: '2em' }}>
                        {
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingTop: 20
                                }}
                            >
                                <Spring
                                    config={{ friction: 100, precision: 1 }}
                                    from={{ number: 1 }}
                                    to={{ number: scores.length }}
                                >
                                    {props => <h1 style={{ fontSize: '2em' }}>{Math.floor(props.number)}</h1>}
                                </Spring>
                            </div>
                        }{' '}
                        Number of surveys
                    </h3>

                    <h3 style={{ fontSize: '2em' }}>
                        {
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingTop: 20
                                }}
                            >
                                <Spring
                                    config={{ friction: 400, precision: 0.1 }}
                                    from={{ number: 1 }}
                                    to={{
                                        number: average(
                                            scores.flatMap(score =>
                                                score.tfIdf.results.map(res =>
                                                    average(Object.values(res.userRating.ratings))
                                                )
                                            )
                                        ).toFixed(1)
                                    }}
                                >
                                    {props => <h1 style={{ fontSize: '2em' }}>{props.number.toFixed(1)}</h1>}
                                </Spring>
                            </div>
                        }{' '}
                        TF-IDF average user rating
                    </h3>

                    <h3 style={{ fontSize: '2em' }}>
                        {
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingTop: 20
                                }}
                            >
                                <Spring
                                    config={{ friction: 400, precision: 0.1 }}
                                    from={{ number: 1 }}
                                    to={{
                                        number: average(
                                            scores.flatMap(score =>
                                                score.doc2vec.results.map(res =>
                                                    average(Object.values(res.userRating.ratings))
                                                )
                                            )
                                        ).toFixed(1)
                                    }}
                                >
                                    {props => <h1 style={{ fontSize: '2em' }}>{props.number.toFixed(1)}</h1>}
                                </Spring>
                            </div>
                        }{' '}
                        Doc2Vec average user rating
                    </h3>
                </div>
            </Fade>

            <div style={{ backgroundColor: '#8797AF' }}>
                <Fade bottom>
                    <h1
                        style={{
                            color: '#E6E8EF',
                            fontSize: '2em',
                            paddingTop: 50,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        INTRODUCTION
                    </h1>
                </Fade>
                <Fade bottom>
                    <h1
                        style={{
                            color: '#E6E8EF',

                            paddingLeft: 20,
                            paddingRight: 20,
                            fontSize: '1.5em',
                            paddingTop: 15,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            textAlign: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        Harvard University President Larry Bacow said in a statement Monday evening that "we are deeply
                        concerned that the guidance issued today by US Immigration and Customs Enforcement imposes a
                        blunt, one-size-fits-all approach to a complex problem giving international students,
                        particularly those in online programs, few options beyond leaving the country or transferring
                        schools.
                    </h1>
                </Fade>

                <Fade bottom>
                    <div
                        style={{
                            paddingTop: 50,
                            paddingBottom: 100,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ScatterChart
                            docs={scores}
                            withSimilarity
                            withCombined
                            width={800}
                            height={650}
                            title="First"
                            scoreName="Similarity Score + Google Vision Confidence"
                        />
                    </div>
                </Fade>
            </div>
            <div style={{}}>
                <Fade bottom>
                    <h1
                        style={{
                            fontSize: '2em',
                            paddingTop: 50,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        INTRODUCTION
                    </h1>
                </Fade>
                <Fade bottom>
                    <h1
                        style={{
                            paddingLeft: 20,
                            paddingRight: 20,
                            fontSize: '1.5em',
                            paddingTop: 15,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            textAlign: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        Harvard University President Larry Bacow said in a statement Monday evening that "we are deeply
                        concerned that the guidance issued today by US Immigration and Customs Enforcement imposes a
                        blunt, one-size-fits-all approach to a complex problem giving international students,
                        particularly those in online programs, few options beyond leaving the country or transferring
                        schools.
                    </h1>
                </Fade>
            </div>

            <Fade bottom>
                <div
                    style={{
                        paddingTop: 50,
                        paddingBottom: 100,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <ScatterChart
                        docs={scores}
                        width={800}
                        height={650}
                        title="Second"
                        scoreName="Google Vision Confidence"
                    />
                </div>
            </Fade>

            <div style={{ backgroundColor: '#8797AF' }}>
                <Fade bottom>
                    <h1
                        style={{
                            color: '#E6E8EF',
                            fontSize: '2em',
                            paddingTop: 50,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        INTRODUCTION
                    </h1>
                </Fade>
                <Fade bottom>
                    <h1
                        style={{
                            color: '#E6E8EF',
                            paddingLeft: 20,
                            paddingRight: 20,
                            fontSize: '1.5em',
                            paddingTop: 15,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            textAlign: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        Harvard University President Larry Bacow said in a statement Monday evening that "we are deeply
                        concerned that the guidance issued today by US Immigration and Customs Enforcement imposes a
                        blunt, one-size-fits-all approach to a complex problem giving international students,
                        particularly those in online programs, few options beyond leaving the country or transferring
                        schools.
                    </h1>
                </Fade>

                <Fade bottom>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            margin: '20px 0',
                            justifyContent: 'space-evenly',
                            paddingTop: 50,
                            paddingBottom: 100
                        }}
                    >
                        <ScatterChart docs={scores} ratingType="objects" scoreName="Google Vision Confidence" />
                        <ScatterChart docs={scores} ratingType="background" scoreName="Google Vision Confidence" />
                        <ScatterChart docs={scores} ratingType="scenario" scoreName="Google Vision Confidence" />
                    </div>
                </Fade>
            </div>

            <div style={{}}>
                <Fade bottom>
                    <h1
                        style={{
                            fontSize: '2em',
                            paddingTop: 50,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        INTRODUCTION
                    </h1>
                </Fade>
                <Fade bottom>
                    <h1
                        style={{
                            paddingLeft: 20,
                            paddingRight: 20,
                            fontSize: '1.5em',
                            paddingTop: 15,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            textAlign: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        Harvard University President Larry Bacow said in a statement Monday evening that "we are deeply
                        concerned that the guidance issued today by US Immigration and Customs Enforcement imposes a
                        blunt, one-size-fits-all approach to a complex problem giving international students,
                        particularly those in online programs, few options beyond leaving the country or transferring
                        schools.
                    </h1>
                </Fade>
            </div>

            <Fade bottom>
                <div
                    style={{
                        paddingTop: 50,
                        paddingBottom: 100,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <ChartAverageRating docs={scores} ratingType="" width={800} height={650} />
                </div>
            </Fade>

            <div style={{ backgroundColor: '#8797AF' }}>
                <Fade bottom>
                    <h1
                        style={{
                            color: '#E6E8EF',
                            fontSize: '2em',
                            paddingTop: 50,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        INTRODUCTION
                    </h1>
                </Fade>
                <Fade bottom>
                    <h1
                        style={{
                            color: '#E6E8EF',
                            paddingLeft: 20,
                            paddingRight: 20,
                            fontSize: '1.5em',
                            paddingTop: 15,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            textAlign: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        Harvard University President Larry Bacow said in a statement Monday evening that "we are deeply
                        concerned that the guidance issued today by US Immigration and Customs Enforcement imposes a
                        blunt, one-size-fits-all approach to a complex problem giving international students,
                        particularly those in online programs, few options beyond leaving the country or transferring
                        schools.
                    </h1>
                </Fade>

                <Fade bottom>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            margin: '20px 0',
                            justifyContent: 'space-evenly',
                            paddingTop: 50,
                            paddingBottom: 100
                        }}
                    >
                        <ChartAverageRating docs={scores} ratingType="objects" />

                        <ChartAverageRating docs={scores} ratingType="background" />

                        <ChartAverageRating docs={scores} ratingType="scenario" />
                    </div>
                </Fade>
            </div>

            <div style={{}}>
                <Fade bottom>
                    <h1
                        style={{
                            fontSize: '2em',
                            paddingTop: 50,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        INTRODUCTION
                    </h1>
                </Fade>
                <Fade bottom>
                    <h1
                        style={{
                            paddingLeft: 20,
                            paddingRight: 20,
                            fontSize: '1.5em',
                            paddingTop: 15,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            textAlign: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        Harvard University President Larry Bacow said in a statement Monday evening that "we are deeply
                        concerned that the guidance issued today by US Immigration and Customs Enforcement imposes a
                        blunt, one-size-fits-all approach to a complex problem giving international students,
                        particularly those in online programs, few options beyond leaving the country or transferring
                        schools.
                    </h1>
                </Fade>

                <Fade bottom>
                    <div
                        style={{
                            paddingTop: 50,
                            paddingBottom: 100,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ScatterChart
                            docs={scores}
                            onlySimilarity
                            withCombined
                            width={800}
                            height={650}
                            title="First"
                            scoreName="Similarity Score"
                        />
                    </div>
                </Fade>
            </div>
            <div style={{ backgroundColor: '#8797AF' }}>
                <div>
                    <Fade bottom>
                        <h1
                            style={{
                                color: '#E6E8EF',
                                fontSize: '2em',
                                paddingTop: 50,
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            INTRODUCTION
                        </h1>
                    </Fade>
                    <Fade bottom>
                        <h1
                            style={{
                                color: '#E6E8EF',
                                paddingLeft: 20,
                                paddingRight: 20,
                                fontSize: '1.5em',
                                paddingTop: 15,
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                textAlign: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            Harvard University President Larry Bacow said in a statement Monday evening that "we are
                            deeply concerned that the guidance issued today by US Immigration and Customs Enforcement
                            imposes a blunt, one-size-fits-all approach to a complex problem giving international
                            students, particularly those in online programs, few options beyond leaving the country or
                            transferring schools.
                        </h1>
                    </Fade>
                </div>

                <Fade bottom>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            paddingTop: 50,
                            paddingBottom: 100,
                            justifyContent: 'space-evenly'
                        }}
                    >
                        <div style={{}}>
                            <div
                                style={{
                                    color: '#E6E8EF',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    paddingBottom: 30
                                }}
                            >
                                <RangeSlider range={tfIdfRange} setRange={setTfIdfRange} similarityAlgorithm="TF-IDF" />
                            </div>
                            <PieCategoryRatings
                                range={tfIdfRange}
                                docs={scores}
                                similarityAlgorithm="tfIdf"
                                algorithmTitle="TF-IDF"
                            />
                        </div>
                        <div>
                            <div
                                style={{
                                    color: '#E6E8EF',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    paddingBottom: 30
                                }}
                            >
                                <RangeSlider
                                    range={doc2vecRange}
                                    setRange={setDoc2vecRange}
                                    similarityAlgorithm="Doc2Vec"
                                />
                            </div>

                            <PieCategoryRatings
                                range={doc2vecRange}
                                docs={scores}
                                similarityAlgorithm="doc2vec"
                                algorithmTitle="Doc2Vec"
                            />
                        </div>
                    </div>
                </Fade>
            </div>
        </div>
    );
};
export default SurveyResults;
