import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState } from 'react';
import { lens, updateArray } from '../../utils/func-utils';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { SERVER_URL } from '../../utils/consts';
import Spinner from 'react-bootstrap/Spinner';
import VerticalSlider from '../../components/vertical-slider/VerticalSlider';
import axios from 'axios';
import firebase from '../../config/firebase';
import { toImageURL } from '../../utils/app-utils';

const Survey = () => {
    const [imageDescriptions, setImageDescriptions] = useState('');
    const [results, setResults] = useState({ tfIdf: [], doc2vec: [] });
    const [searchImage, setSearchImage] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [queryTime, setQueryTime] = useState({ tfIdf: null, doc2vec: null });
    const [ratings, setRatings] = useState({
        tfIdf: [5, 5, 5, 5, 5],
        doc2vec: [5, 5, 5, 5, 5]
    });
    const [clearScreen, setClearScreen] = useState(false);
    const [imageInputRef, setImageInputRef] = useState('');
    const db = firebase.firestore();

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
                setSearchImage(toImageURL(searchedImage.body._source.image_path));

                const doc2vecResults = doc2vec.body.hits.hits;

                if (tfIdfResults && tfIdfResults.length > 0 && doc2vecResults && doc2vecResults.length > 0) {
                    setError(false);
                    setResults({
                        tfIdf: tfIdfResults,
                        doc2vec: doc2vecResults
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
                setRatings({ tfIdf: [5, 5, 5, 5, 5], doc2vec: [5, 5, 5, 5, 5] });
                setError(false);
                setQueryTime({ tfIdf: null, doc2vec: null });
                imageInputRef.value = null;
                console.log(res);
            })
            .catch(err => {
                setError(err);
            });
    };

    return (
        <Container fluid>
            <h1>Pic Similarity Service - Survey</h1>
            <Button varient="primary" onClick={onClickGetSimilar} type="submit" style={{ marginRight: 10 }}>
                Get Random
            </Button>
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
                        <Card style={{ width: '18rem' }}>
                            <Card.Img variant="top" src={searchImage} />
                            <Card.Body>
                                <Card.Title>Search Image</Card.Title>
                                <Card.Text>{imageDescriptions}</Card.Text>
                            </Card.Body>
                        </Card>
                    ) : null}
                    <h4>tfIdf results</h4>
                    <Row>
                        {results.tfIdf.map(hit => {
                            const { image_path, labelAnnotations } = hit._source;

                            const descriptions = labelAnnotations.map(annotation => {
                                return annotation.description;
                            });
                            const descriptionString = descriptions.join(', ');
                            const url = toImageURL(image_path);
                            return (
                                <Card key={image_path} style={{ width: '18rem' }}>
                                    <Card.Img variant="top" src={url} />
                                    <Card.Body>
                                        <Card.Title>Score: {Math.round((hit._score - 1) * 100)}%</Card.Title>
                                        <Card.Title>Lables</Card.Title>
                                        <Card.Text>{descriptionString}</Card.Text>
                                    </Card.Body>
                                </Card>
                            );
                        })}
                    </Row>
                    <Row>
                        <VerticalSlider
                            onSetSlider={numChosen =>
                                setRatings({
                                    ...ratings,
                                    tfIdf: updateArray(ratings.tfIdf, 0, numChosen)
                                })
                            }
                        ></VerticalSlider>
                        <VerticalSlider
                            onSetSlider={numChosen =>
                                setRatings({
                                    ...ratings,
                                    tfIdf: updateArray(ratings.tfIdf, 1, numChosen)
                                })
                            }
                        ></VerticalSlider>{' '}
                        <VerticalSlider
                            onSetSlider={numChosen =>
                                setRatings({
                                    ...ratings,
                                    tfIdf: updateArray(ratings.tfIdf, 2, numChosen)
                                })
                            }
                        ></VerticalSlider>{' '}
                        <VerticalSlider
                            onSetSlider={numChosen =>
                                setRatings({
                                    ...ratings,
                                    tfIdf: updateArray(ratings.tfIdf, 3, numChosen)
                                })
                            }
                        ></VerticalSlider>{' '}
                        <VerticalSlider
                            onSetSlider={numChosen =>
                                setRatings({
                                    ...ratings,
                                    tfIdf: updateArray(ratings.tfIdf, 4, numChosen)
                                })
                            }
                        ></VerticalSlider>
                    </Row>
                    <h4>doc2vec results</h4>
                    <Row>
                        {results.doc2vec.map(hit => {
                            const { image_path, labelAnnotations } = hit._source;
                            const descriptions = labelAnnotations.map(annotation => {
                                return annotation.description;
                            });
                            const descriptionString = descriptions.join(', ');
                            const url = `${SERVER_URL}/image-storage/${image_path}`;
                            return (
                                <Card key={image_path} style={{ width: '18rem' }}>
                                    <Card.Img variant="top" src={url} />
                                    <Card.Body>
                                        <Card.Title>Score: {Math.round((hit._score - 1) * 100)}%</Card.Title>
                                        <Card.Title>Lables</Card.Title>
                                        <Card.Text>{descriptionString}</Card.Text>
                                    </Card.Body>
                                </Card>
                            );
                        })}
                    </Row>
                    <Row>
                        <VerticalSlider
                            onSetSlider={numChosen =>
                                setRatings({
                                    ...ratings,
                                    doc2vec: updateArray(ratings.doc2vec, 0, numChosen)
                                })
                            }
                        ></VerticalSlider>
                        <VerticalSlider
                            onSetSlider={numChosen =>
                                setRatings({
                                    ...ratings,
                                    doc2vec: updateArray(ratings.doc2vec, 1, numChosen)
                                })
                            }
                        ></VerticalSlider>{' '}
                        <VerticalSlider
                            onSetSlider={numChosen =>
                                setRatings({
                                    ...ratings,
                                    doc2vec: updateArray(ratings.doc2vec, 2, numChosen)
                                })
                            }
                        ></VerticalSlider>{' '}
                        <VerticalSlider
                            onSetSlider={numChosen =>
                                setRatings({
                                    ...ratings,
                                    doc2vec: updateArray(ratings.doc2vec, 0, numChosen)
                                })
                            }
                        ></VerticalSlider>{' '}
                        <VerticalSlider
                            onSetSlider={numChosen =>
                                setRatings({
                                    ...ratings,
                                    doc2vec: updateArray(ratings.doc2vec, 3, numChosen)
                                })
                            }
                        ></VerticalSlider>
                    </Row>
                    <Button varient="primary" onClick={addVoteToFirebase} type="submit">
                        Submit
                    </Button>
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
