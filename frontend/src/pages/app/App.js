import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { SERVER_PORT } from '../../utils/consts';
import Spinner from 'react-bootstrap/Spinner';
import axios from 'axios';
import firebase from '../../config/firebase';

const SERVER_URL = `http://localhost:${SERVER_PORT}/upload`;
const db = firebase.firestore();

const App = () => {
    const [imageDescriptions, setImageDescriptions] = useState('');
    const [results, setResults] = useState({ tfIdf: [], doc2vec: [] });
    const [searchImage, setSearchImage] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [clearScreen, setClearScreen] = useState(false);
    const [imageInputRef, setImageInputRef] = useState('');

    const getURL = hit => {
        const { image_path, labelAnnotations } = hit._source;
        const descriptions = labelAnnotations.map(annotation => {
            return annotation.description;
        });
        return `http://localhost:${SERVER_PORT}/image-storage/${image_path}`;
    };
    const onChangeFilePicker = event => {
        setSearchImage(event.target.files[0]);
    };
    const onClickGetSimilar = () => {
        setClearScreen(false);
        setError(false);
        setLoading(true);
        const data = new FormData();
        data.append('file', searchImage);
        axios
            .post(SERVER_URL, data, {})
            .then(res => {
                console.log('res', res);

                const tfIdfResults = res.data.tfIdf.body.hits.hits;
                const doc2vecResults = res.data.doc2vec.body.hits.hits;
                const {
                    data: {
                        searchedImage: {
                            body: { _source: labelAnnotations }
                        }
                    }
                } = res;

                if (tfIdfResults && tfIdfResults.length > 0 && doc2vecResults && doc2vecResults.length > 0) {
                    setError(false);
                    setResults({
                        tfIdf: tfIdfResults,
                        doc2vec: doc2vecResults
                    });
                    setImageDescriptions(
                        labelAnnotations
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

    return (
        <Container>
            <h1>Pic Similarity Service</h1>
            <h2>Upload Image</h2>
            <input
                type="file"
                accept="image/*"
                name="file"
                onChange={onChangeFilePicker}
                ref={ref => setImageInputRef(ref)}
            />
            <Button
                varient="primary"
                onClick={onClickGetSimilar}
                type="submit"
                disabled={!searchImage}
                style={{ marginRight: 10 }}
            >
                Get Similar
            </Button>
            {loading ? <Spinner animation="border" /> : null}

            {!error && !loading && results.tfIdf.length > 0 && results.doc2vec.length > 0 && !clearScreen ? (
                <Container>
                    {imageDescriptions && !clearScreen ? (
                        <Card style={{ width: '18rem' }}>
                            <Card.Img variant="top" src={getURL(results.searchedImage._source.image_path)} />
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
                            const url = `http://localhost:${SERVER_PORT}/image-storage/${image_path}`;
                            return (
                                <Card style={{ width: '18rem' }}>
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
                    <h4>doc2vec results</h4>

                    <Row>
                        {results.doc2vec.map(hit => {
                            const { image_path, labelAnnotations } = hit._source;
                            const descriptions = labelAnnotations.map(annotation => {
                                return annotation.description;
                            });
                            const descriptionString = descriptions.join(', ');
                            const url = `http://localhost:${SERVER_PORT}/image-storage/${image_path}`;
                            return (
                                <Card style={{ width: '18rem' }}>
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
                </Container>
            ) : null}
        </Container>
    );
};
export default App;
