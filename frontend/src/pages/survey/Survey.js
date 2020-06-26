import 'bootstrap/dist/css/bootstrap.min.css';

import React, { createRef, useState } from 'react';
import { toImageURL, toPercentage } from '../../utils/app-utils';

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import HoverRating from '../../components/hover-rating/HoverRating';
import NotificationSystem from 'react-notification-system';
import { SERVER_URL } from '../../utils/consts';
import Spinner from 'react-bootstrap/Spinner';
import axios from 'axios';
import { firestore as db } from '../../config/firebase';

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
    const notificationSystem = createRef();

    // const addNotification = () => {

    // };
    const onClickGetSimilar = () => {
        setError(false);
        setLoading(true);
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
        return db
            .collection('scores')
            .add({
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
            })
            .then(_ => {
                setResultIndex(0);
                setResults(null);
                setUniqueResults(null);
                setSearchImage(null);
                setError(false);
                setQueryTime({ tfIdf: null, doc2vec: null });
                setLoading(false);
            })
            .catch(err => {
                setResultIndex(0);
                setResults(null);
                setUniqueResults(null);
                setSearchImage(null);
                setError(false);
                setQueryTime({ tfIdf: null, doc2vec: null });
                setError(err);
                setLoading(false);
            });
    };

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
        return (
            <img
                style={{ objectFit: 'cover', float: 'right', height: '70vh', width: '40vw' }}
                src={toImageURL(image_path)}
            />
        );
    };

    return (
        <Container fluid>
            <NotificationSystem ref={notificationSystem} />
            {showInstructions ? (
                <div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingTop: 50
                        }}
                    >
                        <h1>Survey</h1>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
                        <h3>Instructions</h3>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <h4>When answering the survey, Please take in consideration the following questions:</h4>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <h4>How much are the objects in the pictures similiar to the searched image?</h4>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <h4>How much are the background of the pictures similiar to the searched image?</h4>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <h4>How much are the colors of the pictures similiar to the searched image?</h4>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <h4>
                            How much is the situation/scenario in the pictures similiar to the one in the searched
                            image?
                        </h4>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <h4>
                            How much does the percentage displayed under each pictures represent the similarity to the
                            searched image?
                        </h4>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Button
                            varient="primary"
                            onClick={() => {
                                setShowInstructions(false);
                                onClickGetSimilar();
                            }}
                            style={{ marginTop: 30, marginBottom: 30 }}
                        >
                            Start
                        </Button>
                    </div>
                </div>
            ) : null}
            {loading ? <Spinner animation="border" /> : null}
            {!error && !loading && uniqueResults && uniqueResults.length > 0 ? (
                <div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: 30
                        }}
                    >
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
                        <div
                            style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingLeft: '20px',
                                width: '20vw'
                            }}
                        >
                            <h1 style={{ textAlign: 'center', marginBottom: 50, marginTop: 10 }}>
                                {resultIndex + 1} / {uniqueResults.length}
                            </h1>
                            <h6>Objects</h6>
                            <div>
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

                            <div>
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
                            <h6>Situation / Scenrio</h6>

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
                                            notificationSystem.current.addNotification({
                                                title: 'Successfully submitted survey!',
                                                message: 'Please try doing another one!',
                                                level: 'success'
                                            });
                                            setLoading(true);
                                            addVoteToFirebase().then(_ => {
                                                onClickGetSimilar().then(_ => setLoading(false));
                                            });
                                        } else {
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
                        {displayImage()}
                    </div>
                </div>
            ) : null}
        </Container>
    );
};

export default Survey;
