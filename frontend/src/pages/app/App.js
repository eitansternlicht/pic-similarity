// import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import React, { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { SERVER_PORT } from '../../utils/consts';
import Spinner from 'react-bootstrap/Spinner';
import { auth } from '../../config/firebase';
import axios from 'axios';
import { toImageURL } from '../../utils/app-utils';
import { API } from '../../config/GoogleVision';

const SERVER_URL = `http://localhost:${SERVER_PORT}/upload`;

const App = () => {
    const [imageDescriptions, setImageDescriptions] = useState('');
    const [results, setResults] = useState({ tfIdf: [], doc2vec: [] });
    const [searchImage, setSearchImage] = useState(undefined);
    const [displaySearchedImage, setDisplaySearchedImage] = useState(undefined);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [clearScreen, setClearScreen] = useState(false);
    const [imageInputRef, setImageInputRef] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);

    const onChangeFilePicker = event => {
        setSearchImage(event.target.files[0]);
        setDisplaySearchedImage(URL.createObjectURL(event.target.files[0]));
    };

    function uploadFiles(event) {
        event.stopPropagation(); // Stop stuff happening
        event.preventDefault(); // Totally stop stuff happening

        //Grab the file and asynchronously convert to base64.
        var file = searchImage;
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = processFile;
    }

    function processFile(event) {
        const encodedFile = event.target.result.replace('data:image/jpeg;base64,', '');

        //console.log(fromByteArray(encodedFile));
        sendFiletoCloudVision(encodedFile);
    }

    const sendFiletoCloudVision = encodedFile => {
        const reqBody = {
            requests: [
                {
                    image: {
                        content: encodedFile
                    },
                    features: [
                        {
                            type: 'LABEL_DETECTION'
                        }
                    ]
                }
            ]
        };

        axios
            .post('https://vision.googleapis.com/v1/images:annotate?key=' + API, reqBody)
            .then(res => console.log(res));
    };

    const onClickGetGoogleVisionResults = () => {
        alert("i'm here");
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
    const login = (
        <div class="container" onclick="onclick">
            <div class="top"></div>
            <div class="bottom"></div>
            <div class="center">
                <h2>Please Sign In</h2>
                <input type="email" placeholder="email" value={email} onInput={event => setEmail(event.target.value)} />
                <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onInput={event => setPassword(event.target.value)}
                />
                <button
                    onClick={() => {
                        auth.signInWithEmailAndPassword(email, password).then(
                            _ => {
                                setLoggedIn(true);
                                setLoginError(null);
                                setEmail('');
                                setPassword('');
                            },
                            error => {
                                setLoginError(error.toString());
                            }
                        );
                    }}
                >
                    Sign in
                </button>
                {loginError ? <div style={{ color: 'red', marginTop: 10 }}>{loginError}</div> : null}
            </div>
        </div>
    );
    const mainApp = (
        <Container fluid>
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

            <Button
                varient="primary"
                onClick={uploadFiles}
                type="submit"
                disabled={!searchImage}
                style={{ marginRight: 10 }}
            >
                Google cloud vision
            </Button>
            {loading ? <Spinner animation="border" /> : null}

            {!error && !loading && results.tfIdf.length > 0 && results.doc2vec.length > 0 && !clearScreen ? (
                <Container fluid>
                    <img src={displaySearchedImage} />
                    {imageDescriptions && !clearScreen ? (
                        <Card style={{ width: '18rem' }}>
                            <Card.Img variant="top" src={toImageURL(results.searchedImage._source.image_path)} />
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
    return loggedIn ? mainApp : login;
};
export default App;
