import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import React, { useState } from "react";

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";
import { lens } from "./utils/funcutils";

const PORT = 3000;
function App() {
    const [imageDescriptions, setImageDescriptions] = useState("");
    const [results, setResults] = useState([]);
    const [searchImage, setSearchImage] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [queryTime, setQueryTime] = useState(null)

    const onChangeFilePicker = event => {
        setSearchImage(event.target.files[0]);
    };
    const onClickGetSimilar = () => {
        const date1 = new Date()
        setLoading(true);
        console.log("onClickGetSimilar", searchImage);
        const data = new FormData();
        data.append("file", searchImage);
        axios
            .post(`http://localhost:${PORT}/upload`, data, {})
            .then(res => {
                console.log("res", res);
                setLoading(false);
                const results = lens(res, "data.elasticSearchResult.body.hits.hits");
                if (results && results.length > 0) {
                    setError(false);
                    setResults(res.data.elasticSearchResult.body.hits.hits.slice(1));
                    setImageDescriptions(res.data.elasticSearchResult.body.hits.hits[0]._source.labelAnnotations.map(annotation => {
                            return annotation.description
                    }).join(", "));
                    setQueryTime(new Date() - date1)
                }
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
            <input type="file" accept="image/*" name="file" onChange={onChangeFilePicker} />
            <Button
                varient="primary"
                onClick={onClickGetSimilar}
                type="submit"
                disabled={!searchImage}
                style={{marginRight: 10}}
            >
                Get Similar
            </Button>
    {queryTime? <span> Query Time: {queryTime} ms</span>: null}
            {loading ? <Spinner animation="border" /> : null}

            {!error && !loading && results.length > 0 ? (
                <Container>
                    {imageDescriptions ? (
                        <>
                        <h3>Descriptions extracted from search image: </h3>
                        <h4>{imageDescriptions}</h4>
                        </>
                    ) : null}
                    <Row>
                        {results.map(hit => {
                            const { image_path , labelAnnotations} = hit._source;
                            const descriptions = labelAnnotations.map(annotation =>{
                                return annotation.description;
                            })
                            const descriptionString = descriptions.join(", ")
                            const url = `http://localhost:${PORT}/image-storage/${image_path}`;
                            console.log("url", url);
                            return (
                                <Card style={{ width: "18rem" }}>
                                    <Card.Img variant="top" src={url} />
                                    <Card.Body>
                                        <Card.Title>Descriptions</Card.Title>
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
}

export default App;
