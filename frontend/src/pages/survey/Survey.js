import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import './Survey.css';

import React, { createRef, useState } from 'react';
import { animated, interpolate, useSpring, useSprings } from 'react-spring';
import { toImageURL, toPercentage } from '../../utils/app-utils';

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
// import Deck from '../../components/deck/Deck';
import HoverRating from '../../components/hover-rating/HoverRating';
import Loader from 'react-loader-spinner';
import NotificationSystem from 'react-notification-system';
import { SERVER_URL } from '../../utils/consts';
import axios from 'axios';
import { firestore as db } from '../../config/firebase';

const to = i => ({ x: 0, y: i * -4, scale: 1, rot: -10 + Math.random() * 20, delay: i * 100 });
const from = i => ({ x: 0, y: -1000, scale: 1.5, rot: 0 });
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r, s) => `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

const Survey = () => {
    const [showInstructions, setShowInstructions] = useState(true);
    const [imageDescriptions, setImageDescriptions] = useState('');
    const [results, setResults] = useState([]);
    const [uniqueResults, setUniqueResults] = useState([]);
    const [searchImage, setSearchImage] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [queryTime, setQueryTime] = useState({ tfIdf: null, doc2vec: null });
    const [resultIndex, setResultIndex] = useState(null);
    const [objectsRating, setObjectsRating] = useState(2.5);
    const [backgroundRating, setBackgroundRating] = useState(2.5);
    const [scenarioRating, setScenarioRating] = useState(2.5);
    const [genSpinnerDone, setGenSpinnerDone] = useState(false);
    const [searchSpinnerDone, setSearchSpinnerDone] = useState(false);
    const notificationSystem = createRef();
    const { opacity: genImageOpacity } = useSpring({
        to: { opacity: searchImage && genSpinnerDone ? 1 : 0 },
        from: { opacity: 0 },
        config: { duration: 3000 }
    });
    const { opacity: similarImageOpacity } = useSpring({
        to: { opacity: uniqueResults.length && searchSpinnerDone ? 1 : 0 },
        from: { opacity: 0 },
        config: { duration: 3000 }
    });
    const [props, set] = useSprings(uniqueResults.length, i => ({ ...to(i), from: from(i) }));

    const getSimilar = () => {
        setError(false);
        setLoading(true);
        setGenSpinnerDone(false);
        setSearchSpinnerDone(false);
        // setResultIndex(0);
        setResults([]);
        setUniqueResults([]);
        setSearchImage(null);
        setQueryTime({
            tfIdf: null,
            doc2vec: null
        });
        return axios
            .get(`${SERVER_URL}/random`)
            .then(res => {
                console.log('res', res);
                const { searchedImage, tfIdf, doc2vec } = res.data;
                const tfIdfResults = tfIdf.body.hits.hits;
                const doc2vecResults = doc2vec.body.hits.hits;
                const sortedResults = tfIdfResults
                    .map(result => ({
                        algorithm: 'tfIdf',
                        userRating: {
                            ratings: { objects: 5, background: 5, scoreRating: 5, scenario: 5 },
                            similarityScore: toPercentage(result._score)
                        },
                        result
                    }))
                    .concat(
                        doc2vecResults.map(result => ({
                            algorithm: 'doc2vec',
                            userRating: {
                                ratings: { objects: 5, background: 5, scoreRating: 5, scenario: 5 },
                                similarityScore: toPercentage(result._score)
                            },
                            result
                        }))
                    )
                    .sort((res1, res2) => (res1.result._score < res2.result._score ? 1 : -1));
                const uniqueImages = new Set([]);
                const uniqueResults = [];
                sortedResults.forEach(res => {
                    const { image_path } = res.result._source;
                    if (!uniqueImages.has(image_path)) {
                        uniqueResults.push(res);
                        uniqueImages.add(image_path);
                    }
                });

                setResults(sortedResults);
                setUniqueResults(uniqueResults);
                setResultIndex(0);

                console.log('results', sortedResults);
                setQueryTime({
                    tfIdf: tfIdf.body.took,
                    doc2vec: doc2vec.body.took
                });
                console.log('searchedImage', searchedImage);
                setSearchImage(searchedImage.body.hits.hits[0]._source);

                if (sortedResults.length > 0) {
                    setError(false);
                    setImageDescriptions(
                        searchedImage.body.hits.hits[0]._source.labelAnnotations
                            .map(annotation => {
                                return annotation.description;
                            })
                            .join(', ')
                    );
                }
                setLoading(false);
                // if (genSpinnerDone) {
                //     console.log('took awhile');
                //     setSearchSpinnerDone(false);
                //     setTimeout(() => setSearchSpinnerDone(true), 2500);
                // }
            })
            .catch(e => {
                console.error(e);
                setLoading(false);
            });
    };

    const addVoteToFirebase = () => {
        const uniqueRatings = Object.fromEntries(
            uniqueResults.map(res => [res.result._source.image_path, res.userRating])
        );
        const nonUniqueResults = results.map(res => ({
            ...res,
            userRating: uniqueRatings[res.result._source.image_path]
        }));
        return db.collection('scores').add({
            searchedImage: searchImage,
            tfIdf: {
                queryTime: queryTime.tfIdf,
                results: nonUniqueResults
                    .filter(res => res.algorithm === 'tfIdf')
                    .map(
                        ({
                            userRating,
                            result: {
                                _source: { labelAnnotations, image_path }
                            }
                        }) => {
                            return {
                                imagePath: image_path,
                                labelAnnotations,
                                userRating
                            };
                        }
                    )
            },
            doc2vec: {
                queryTime: queryTime.doc2vec,
                results: nonUniqueResults
                    .filter(res => res.algorithm === 'doc2vec')
                    .map(
                        ({
                            userRating,
                            result: {
                                _source: { labelAnnotations, image_path }
                            }
                        }) => {
                            return {
                                imagePath: image_path,
                                labelAnnotations,
                                userRating
                            };
                        }
                    )
            }
        });
        // .then(_ => {
        //     setResultIndex(0);
        //     setResults([]);
        //     setUniqueResults([]);
        //     setSearchImage(null);
        //     setError(false);
        //     setQueryTime({ tfIdf: null, doc2vec: null });
        //     setLoading(false);
        // })
        // .catch(err => {
        //     setResultIndex(0);
        //     setResults([]);
        //     setUniqueResults([]);
        //     setSearchImage(null);
        //     setError(false);
        //     setQueryTime({ tfIdf: null, doc2vec: null });
        //     setError(err);
        //     setLoading(false);
        // });
    };
    const cards = uniqueResults.map(({ result: { _source: { image_path } } }) => toImageURL(image_path));

    const displayImage = () => {
        const {
            userRating: { similarityScore },
            result
        } = uniqueResults[resultIndex];
        const { image_path, labelAnnotations } = result._source;
        const descriptions = labelAnnotations.map(annotation => {
            return annotation.description;
        });
        const descriptionString = descriptions.join(', ');
        return !searchSpinnerDone ? (
            <div
                style={{
                    height: '70vh',
                    width: '40vw',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    paddingTop: 50
                }}
            >
                <Loader type="Puff" color="#57737A" height={160} width={160} />
                <div className="raleway" style={{ color: '#57737A', marginTop: 20, fontSize: 30 }}>
                    Searching for similar images...
                </div>
            </div>
        ) : (
            <div>
                <animated.h1
                    className="raleway"
                    style={{ textAlign: 'center', marginBottom: 10, opacity: similarImageOpacity }}
                >
                    Similar Images Found ({uniqueResults.length})
                </animated.h1>
                {props.map(({ x, y, rot, scale }, i) => (
                    <animated.div
                        className="div"
                        key={i}
                        style={{ transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`) }}
                    >
                        <animated.div
                            style={{ transform: interpolate([rot, scale], trans), backgroundImage: `url(${cards[i]})` }}
                        />
                    </animated.div>
                ))}
            </div>
        );
    };
    const instructions = (
        <div className="raleway">
            <h1 style={{ textAlign: 'center', margin: 30 }}>Survey Instructions</h1>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 10 }}>
                <h4>Please take into consideration the following:</h4>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ol>
                    <li>
                        <h5>
                            How much are the <b>objects</b> in the pictures similar?
                        </h5>
                    </li>
                    <li>
                        <h5>
                            How much are the <b>background & colors</b> similar?
                        </h5>
                    </li>
                    <li>
                        <h5>
                            How much is the <b>situation / scenario</b> similar?
                        </h5>
                    </li>
                </ol>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Button
                    varient="primary"
                    onClick={() => {
                        setShowInstructions(false);
                        setTimeout(() => {
                            setGenSpinnerDone(true);
                            if (!loading) {
                                setTimeout(() => {
                                    setSearchSpinnerDone(true);
                                }, 2500);
                            }
                        }, 2500);
                        getSimilar();
                    }}
                    style={{ marginTop: 30, marginBottom: 30 }}
                >
                    Start
                </Button>
            </div>
        </div>
    );

    return (
        <div style={{ padding: 20 }}>
            <NotificationSystem ref={notificationSystem} />
            {showInstructions ? (
                instructions
            ) : (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 30
                    }}
                >
                    {loading || !genSpinnerDone || !searchImage ? (
                        <div
                            style={{
                                height: '70vh',
                                width: '40vw',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                paddingTop: 50
                            }}
                        >
                            <Loader type="Puff" color="#57737A" height={160} width={160} />
                            <div className="raleway" style={{ color: '#57737A', marginTop: 20, fontSize: 30 }}>
                                Generating Random Image
                            </div>
                        </div>
                    ) : (
                        <div>
                            <animated.h1
                                className="raleway"
                                style={{ textAlign: 'center', marginBottom: 10, opacity: genImageOpacity }}
                            >
                                Generated Random Image
                            </animated.h1>
                            <img
                                style={{
                                    height: '70vh',
                                    width: '40vw',
                                    objectFit: 'cover',
                                    float: 'left',
                                    border: '5px solid red'
                                }}
                                src={toImageURL(searchImage.image_path)}
                            />
                        </div>
                    )}

                    {!loading && genSpinnerDone && searchSpinnerDone && uniqueResults.length ? (
                        <div
                            style={{
                                paddingLeft: '20px',
                                width: '20vw',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column'
                            }}
                        >
                            <h3 className="raleway" style={{ marginBottom: 40 }}>
                                Rate Similarity
                            </h3>

                            <h6>Objects</h6>
                            <div style={{ marginBottom: 20 }}>
                                <HoverRating
                                    ratingName={'objectsRating'}
                                    rating={objectsRating}
                                    setRating={newRating => {
                                        const newResults = [...uniqueResults];
                                        newResults[resultIndex].userRating.ratings.objects = Math.floor(newRating * 2);
                                        setUniqueResults(newResults);
                                        setObjectsRating(newRating);
                                    }}
                                />
                            </div>
                            <h6>Background & Color</h6>

                            <div style={{ marginBottom: 20 }}>
                                <HoverRating
                                    ratingName={'backgroundRating'}
                                    rating={backgroundRating}
                                    setRating={newRating => {
                                        const newResults = [...uniqueResults];
                                        newResults[resultIndex].userRating.ratings.background = Math.floor(
                                            newRating * 2
                                        );
                                        setUniqueResults(newResults);
                                        setBackgroundRating(newRating);
                                    }}
                                />
                            </div>
                            <h6>Situation / Scenario</h6>

                            <div>
                                <HoverRating
                                    ratingName={'scenarioRating'}
                                    rating={scenarioRating}
                                    setRating={newRating => {
                                        const newResults = [...uniqueResults];
                                        newResults[resultIndex].userRating.ratings.scenario = Math.floor(newRating * 2);
                                        setUniqueResults(newResults);
                                        setScenarioRating(newRating);
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    textAlign: 'center'
                                }}
                            >
                                <Button
                                    style={{ marginTop: 50 }}
                                    varient="primary"
                                    onClick={() => {
                                        if (resultIndex === uniqueResults.length - 1) {
                                            set(i =>
                                                uniqueResults.length - 1 - resultIndex === i
                                                    ? {
                                                          x: 900,
                                                          rot: -5,
                                                          scale: 1.1,
                                                          delay: undefined,
                                                          config: { friction: 50, tension: 800, isGone: 800 }
                                                      }
                                                    : undefined
                                            );
                                            notificationSystem.current.addNotification({
                                                title: 'Successfully submitted survey!',
                                                message: 'Please try doing another one!',
                                                level: 'success'
                                            });
                                            addVoteToFirebase();
                                            getSimilar();

                                            setQueryTime({ tfIdf: null, doc2vec: null });

                                            setTimeout(() => {
                                                setGenSpinnerDone(true);
                                                if (!loading) {
                                                    console.log('not loading second time');
                                                    setTimeout(() => {
                                                        setSearchSpinnerDone(true);
                                                    }, 2500);
                                                }
                                            }, 2500);
                                        } else {
                                            set(i =>
                                                uniqueResults.length - 1 - resultIndex === i
                                                    ? {
                                                          x: 900,
                                                          rot: -5,
                                                          scale: 1.1,
                                                          delay: undefined,
                                                          config: { friction: 50, tension: 800, isGone: 800 }
                                                      }
                                                    : undefined
                                            );
                                            setResultIndex(resultIndex + 1);
                                        }

                                        setObjectsRating(2.5);
                                        setBackgroundRating(2.5);
                                        setScenarioRating(2.5);
                                        console.log('uniqueResults', uniqueResults);
                                    }}
                                    type="submit"
                                >
                                    Submit Ratings
                                </Button>
                            </div>
                        </div>
                    ) : null}
                    {!loading && genSpinnerDone && uniqueResults.length ? displayImage() : null}
                </div>
            )}
        </div>
    );
};

export default Survey;
