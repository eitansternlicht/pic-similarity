import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState } from 'react';
import { toImageURL, toPercentage } from '../../utils/app-utils';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { SERVER_URL } from '../../utils/consts';
import Spinner from 'react-bootstrap/Spinner';
import VerticalSlider from '../../components/vertical-slider/VerticalSlider';
import axios from 'axios';
import firebase from '../../config/firebase';
import { updateArray } from '../../utils/func-utils';

const db = firebase.firestore();

const Survey = () => {
    const [imageDescriptions, setImageDescriptions] = useState('');
    const [results, setResults] = useState({ tfIdf: [], doc2vec: [] });
    const [searchImage, setSearchImage] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [queryTime, setQueryTime] = useState({ tfIdf: null, doc2vec: null });
    const [ratings, setRatings] = useState(null);
    const [clearScreen, setClearScreen] = useState(false);
    const [imageInputRef, setImageInputRef] = useState('');

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
                setQueryTime({
                    tfIdf: tfIdf.body.took,
                    doc2vec: doc2vec.body.took
                });
                setSearchImage(searchedImage.body.hits.hits[0]._source);

                const doc2vecResults = doc2vec.body.hits.hits;

                if (tfIdfResults && tfIdfResults.length > 0 && doc2vecResults && doc2vecResults.length > 0) {
                    setError(false);
                    setResults({
                        tfIdf: tfIdfResults,
                        doc2vec: doc2vecResults
                    });
                    setRatings({
                        tfIdf: tfIdfResults.map(res => ({ similarityScore: toPercentage(res._score), rating: 5 })),
                        doc2vec: doc2vecResults.map(res => ({ similarityScore: toPercentage(res._score), rating: 5 }))
                    });
                    setImageDescriptions(
                        tfIdfResults[0]._source.labelAnnotations
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
        console.log('ratings', ratings);
        db.collection('scores')
            .add({
                searchedImage: searchImage,
                tfIdf: {
                    queryTime: queryTime.tfIdf,
                    results: results.tfIdf.map((result, i) => {
                        return {
                            imagePath: result._source.image_path,
                            labelAnnotations: result._source.labelAnnotations,
                            userRating: ratings.tfIdf[i]
                        };
                    })
                },
                doc2vec: {
                    queryTime: queryTime.doc2vec,
                    results: results.doc2vec.map((result, i) => {
                        return {
                            imagePath: result._source.image_path,
                            labelAnnotations: result._source.labelAnnotations,
                            userRating: ratings.doc2vec[i]
                        };
                    })
                }
            })
            .then(res => {
                setClearScreen(true);
                setImageDescriptions(null);
                setResults([]);
                setSearchImage(null);
                setRatings(null);
                setError(false);
                setQueryTime({ tfIdf: null, doc2vec: null });
                imageInputRef.value = null;
            })
            .catch(err => {
                setError(err);
            });
    };

    return (
        <Container fluid>
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h3>Please press the 'Get Random' button to get a set of pics </h3>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
                <h3>Instructions</h3>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h4>When answering the survey, Please take in consideration the following questions:</h4>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h4>How much are the objects in the pictures are similiar to the searched image?</h4>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h4>How much are the background of the pictures are similiar to the searched image?</h4>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h4>How much are the colors of the pictures are similiar to the searched image?</h4>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h4>
                    How much does the situation/senrio in the pictures are similiar to the one in the searched image?
                </h4>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h4>
                    How much does the percentage score that displayed under each pictures represents the similarity to
                    the searched image?
                </h4>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Button
                    varient="primary"
                    onClick={onClickGetSimilar}
                    type="submit"
                    style={{ marginTop: 30, marginBottom: 30 }}
                >
                    Get Random
                </Button>
            </div>
            {loading ? <Spinner animation="border" /> : null}

            {!error &&
            !loading &&
            results.tfIdf &&
            results.tfIdf.length > 0 &&
            results.tfIdf &&
            results.doc2vec.length > 0 &&
            !clearScreen ? (
                <Container fluid>
                    {imageDescriptions && !clearScreen ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Card style={{ width: '18rem' }}>
                                <Card.Img variant="top" src={toImageURL(searchImage.image_path)} />
                                <Card.Body>
                                    <Card.Title>Search Image</Card.Title>
                                    <Card.Text>{imageDescriptions}</Card.Text>
                                </Card.Body>
                            </Card>
                        </div>
                    ) : null}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: 50,
                            marginBottom: 50
                        }}
                    >
                        <h1>tfIdf results</h1>
                    </div>
                    <Row className="justify-content-md-center">
                        {results.tfIdf.map(hit => {
                            const { image_path, labelAnnotations } = hit._source;

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
                                            <Card.Title>Score: {toPercentage(hit._score)}%</Card.Title>
                                            <Card.Title>Lables</Card.Title>
                                            <Card.Text>{descriptionString}</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </div>
                            );
                        })}
                    </Row>
                    <Row className="justify-content-md-center">
                        {results.tfIdf.map((tfIdfResult, index) => (
                            <div style={{ paddingLeft: 150, paddingRight: 150 }}>
                                <VerticalSlider
                                    key={`tfIdf-result-${index}`}
                                    onSetSlider={numChosen =>
                                        setRatings({
                                            ...ratings,
                                            tfIdf: updateArray(ratings.tfIdf, index, {
                                                rating: numChosen,
                                                similarityScore: toPercentage(tfIdfResult._score)
                                            })
                                        })
                                    }
                                ></VerticalSlider>
                            </div>
                        ))}
                    </Row>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: 50,
                            marginBottom: 50
                        }}
                    >
                        <h2>doc2vec results</h2>
                    </div>
                    <Row className="justify-content-md-center">
                        {results.doc2vec.map(hit => {
                            const { image_path, labelAnnotations } = hit._source;
                            const descriptions = labelAnnotations.map(annotation => {
                                return annotation.description;
                            });
                            const descriptionString = descriptions.join(', ');
                            const url = `${SERVER_URL}/image-storage/${image_path}`;
                            return (
                                <div style={{ marginRight: 50 }}>
                                    <Card key={image_path} style={{ width: '18rem' }}>
                                        <Card.Img variant="top" src={url} />
                                        <Card.Body>
                                            <Card.Title>Score: {toPercentage(hit._score)}%</Card.Title>
                                            <Card.Title>Lables</Card.Title>
                                            <Card.Text>{descriptionString}</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </div>
                            );
                        })}
                    </Row>
                    <Row className="justify-content-md-center">
                        {results.doc2vec.map((doc2vecResult, index) => (
                            <div style={{ paddingLeft: 150, paddingRight: 150 }}>
                                <VerticalSlider
                                    key={`tfIdf-result-${index}`}
                                    onSetSlider={numChosen =>
                                        setRatings({
                                            ...ratings,
                                            doc2vec: updateArray(ratings.doc2vec, index, {
                                                rating: numChosen,
                                                similarityScore: toPercentage(doc2vecResult._score)
                                            })
                                        })
                                    }
                                ></VerticalSlider>
                            </div>
                        ))}
                    </Row>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: 50 }}>
                        <Button varient="primary" onClick={addVoteToFirebase} type="submit">
                            Submit
                        </Button>
                    </div>
                </Container>
            ) : clearScreen ? (
                <>
                    <h3>Your feedback has been successfully submitted</h3>
                    <h3>Would you like to rate another?</h3>
                </>
            ) : null}
        </Container>
    );
};

export default Survey;
