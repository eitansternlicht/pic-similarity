import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState } from 'react';
import { toImageURL, toPercentage } from '../../utils/app-utils';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import { SERVER_URL } from '../../utils/consts';
import Spinner from 'react-bootstrap/Spinner';
import VerticalSlider from '../../components/vertical-slider/VerticalSlider';
import axios from 'axios';
import firebase from '../../config/firebase';

const db = firebase.firestore();

const Survey = () => {
    const [showInstructions, setShowInstructions] = useState(true);
    const [imageDescriptions, setImageDescriptions] = useState('');
    const [results, setResults] = useState([]);
    const [searchImage, setSearchImage] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [queryTime, setQueryTime] = useState({ tfIdf: null, doc2vec: null });
    const [clearScreen, setClearScreen] = useState(false);
    const [resultIndex, setResultIndex] = useState(null);

    const onClickGetSimilar = () => {
        setClearScreen(false);
        setError(false);
        setLoading(true);
        axios
            .get(`${SERVER_URL}/random`)
            .then(res => {
                console.log('res', res);
                const { searchedImage, tfIdf, doc2vec } = res.data;
                const tfIdfResults = tfIdf.body.hits.hits;
                const doc2vecResults = doc2vec.body.hits.hits;
                const sortedResults = tfIdfResults
                    .map(result => ({
                        algorithm: 'tfIdf',
                        userRating: { rating: 5, similarityScore: toPercentage(result._score) },
                        result
                    }))
                    .concat(
                        doc2vecResults.map(result => ({
                            algorithm: 'doc2vec',
                            userRating: { rating: 5, similarityScore: toPercentage(result._score) },
                            result
                        }))
                    )
                    .sort((res1, res2) => (res1.result._score < res2.result._score ? 1 : -1));
                setResults(sortedResults);
                setResultIndex(0);

                console.log('results', sortedResults);
                setQueryTime({
                    tfIdf: tfIdf.body.took,
                    doc2vec: doc2vec.body.took
                });
                setSearchImage(searchedImage.body.hits.hits[0]._source);

                if (sortedResults.length > 0) {
                    setError(false);
                    // setResults({
                    //     tfIdf: tfIdfResults,
                    //     doc2vec: doc2vecResults
                    // });
                    // setRatings({
                    //     tfIdf: tfIdfResults.map(res => ({ similarityScore: toPercentage(res._score), rating: 5 })),
                    //     doc2vec: doc2vecResults.map(res => ({ similarityScore: toPercentage(res._score), rating: 5 }))
                    // });
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
        // console.log('ratings', ratings);
        db.collection('scores')
            .add({
                searchedImage: searchImage,
                tfIdf: {
                    queryTime: queryTime.tfIdf,
                    results: results
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
                    results: results
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
            .then(res => {
                setResultIndex(0);
                setClearScreen(true);
                setImageDescriptions(null);
                setResults(null);
                setSearchImage(null);
                setError(false);
                setError(false);
                setQueryTime({ tfIdf: null, doc2vec: null });
            })
            .catch(err => {
                setError(err);
            });
    };

    const displayImage = () => {
        const {
            userRating: { similarityScore },
            result
        } = results[resultIndex];
        const { image_path, labelAnnotations } = result._source;
        const descriptions = labelAnnotations.map(annotation => {
            return annotation.description;
        });
        const descriptionString = descriptions.join(', ');
        const url = toImageURL(image_path);
        return (
            <div style={{ marginRight: 50 }}>
                <Card key={image_path} style={{ width: '18rem' }}>
                    <Card.Img variant="top" src={url} />
                    <Card.Body>
                        <Card.Title>Score: {similarityScore}%</Card.Title>
                        <Card.Title>Lables</Card.Title>
                        <Card.Text>{descriptionString}</Card.Text>
                    </Card.Body>
                </Card>
            </div>
        );
    };

    return (
        <Container fluid>
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
                            How much is the situation/senrio in the pictures similiar to the one in the searched image?
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
                            type="submit"
                            style={{ marginTop: 30, marginBottom: 30 }}
                        >
                            Start
                        </Button>
                    </div>
                </div>
            ) : null}
            {loading ? <Spinner animation="border" /> : null}
            {!error && !loading && results && results.length > 0 ? (
                <div>
                    <h1 style={{ textAlign: 'center' }}>{resultIndex + 1} / 10</h1>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        {imageDescriptions && !clearScreen ? (
                            <div>
                                <Card style={{ width: '18rem' }}>
                                    <Card.Img variant="top" src={toImageURL(searchImage.image_path)} />
                                    <Card.Body>
                                        <Card.Title>Search Image</Card.Title>
                                        <Card.Text>{imageDescriptions}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </div>
                        ) : null}

                        <div style={{ paddingLeft: 150, paddingRight: 150 }}>
                            <VerticalSlider
                                key={`result-${resultIndex}`}
                                onSetSlider={
                                    numChosen => {
                                        const newResults = [...results];
                                        newResults[resultIndex].userRating.rating = numChosen;
                                        setResults(newResults);
                                    }
                                    // setRatings({
                                    //     ...ratings,
                                    //     tfIdf: updateArray(ratings.tfIdf, index, {
                                    //         rating: numChosen,
                                    //         similarityScore: toPercentage(tfIdfResult._score)
                                    //     })
                                    // })
                                }
                            ></VerticalSlider>
                        </div>
                        {displayImage()}
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingBottom: 50
                        }}
                    >
                        <Button
                            varient="primary"
                            onClick={() => {
                                if (resultIndex === results.length - 1) {
                                    addVoteToFirebase();
                                    onClickGetSimilar();
                                } else {
                                    setResultIndex(resultIndex + 1);
                                }
                                console.log('resultssss', results);
                                console.log('results index', resultIndex);
                            }}
                            type="submit"
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            ) : null}
        </Container>
    );
};

export default Survey;
