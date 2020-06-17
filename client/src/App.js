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
import firebase from "./config/Firebase";
import VerticalSlider from "./VerticalSlider";
import { SERVER_PORT } from "./consts";
const SERVER_URL = `http://localhost:${SERVER_PORT}/upload`;

export const App = () => {
  const [imageDescriptions, setImageDescriptions] = useState("");
  const [results, setResults] = useState({ tfIdf: [], doc2vec: [] });
  const [searchImage, setSearchImage] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [clearScreen, setClearScreen] = useState(false);
  const [imageInputRef, setImageInputRef] = useState("");
  const db = firebase.firestore();

  const getURL = (hit) => {
    const { image_path, labelAnnotations } = hit._source;
    const descriptions = labelAnnotations.map((annotation) => {
      return annotation.description;
    });
    return `http://localhost:${SERVER_PORT}/image-storage/${image_path}`;
  };
  const onChangeFilePicker = (event) => {
    setSearchImage(event.target.files[0]);
  };
  const onClickGetSimilar = () => {
    setClearScreen(false);
    setError(false);
    setLoading(true);
    const data = new FormData();
    data.append("file", searchImage);
    axios
      .post(SERVER_URL, data, {})
      .then((res) => {
        console.log("res", res);
        setLoading(false);
        const tfIdfResults = lens(res, "data.tfIdf.body.hits.hits");
        const doc2vecResults = lens(res, "data.doc2vec.body.hits.hits");
        if (
          tfIdfResults &&
          tfIdfResults.length > 0 &&
          doc2vecResults &&
          doc2vecResults.length > 0
        ) {
          setError(false);
          setResults({
            tfIdf: tfIdfResults,
            doc2vec: doc2vecResults,
          });
          setImageDescriptions(
            tfIdfResults[0]._source.labelAnnotations
              .map((annotation) => {
                return annotation.description;
              })
              .join(", ")
          );
        }
      })
      .catch((e) => {
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
        ref={(ref) => setImageInputRef(ref)}
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

      {!error &&
      !loading &&
      results.tfIdf.length > 0 &&
      results.doc2vec.length > 0 &&
      !clearScreen ? (
        <Container>
          {imageDescriptions && !clearScreen ? (
            <Card style={{ width: "18rem" }}>
              <Card.Img variant="top" src={getURL(results.tfIdf[0])} />
              <Card.Body>
                <Card.Title>Search Image</Card.Title>
                <Card.Text>{imageDescriptions}</Card.Text>
              </Card.Body>
            </Card>
          ) : null}
          <h4>tfIdf results</h4>
          <Row>
            {results.tfIdf.slice(1).map((hit) => {
              const { image_path, labelAnnotations } = hit._source;

              const descriptions = labelAnnotations.map((annotation) => {
                return annotation.description;
              });
              const descriptionString = descriptions.join(", ");
              const url = `http://localhost:${SERVER_PORT}/image-storage/${image_path}`;
              console.log("url", url);
              return (
                <Card style={{ width: "18rem" }}>
                  <Card.Img variant="top" src={url} />
                  <Card.Body>
                    <Card.Title>
                      Score: {Math.round((hit._score - 1) * 100)}%
                    </Card.Title>
                    <Card.Title>Lables</Card.Title>
                    <Card.Text>{descriptionString}</Card.Text>
                  </Card.Body>
                </Card>
              );
            })}
          </Row>
          <h4>doc2vec results</h4>

          <Row>
            {results.doc2vec.slice(1).map((hit) => {
              const { image_path, labelAnnotations } = hit._source;
              const descriptions = labelAnnotations.map((annotation) => {
                return annotation.description;
              });
              const descriptionString = descriptions.join(", ");
              const url = `http://localhost:${SERVER_PORT}/image-storage/${image_path}`;
              console.log("url", url);
              return (
                <Card style={{ width: "18rem" }}>
                  <Card.Img variant="top" src={url} />
                  <Card.Body>
                    <Card.Title>
                      Score: {Math.round((hit._score - 1) * 100)}%
                    </Card.Title>
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
