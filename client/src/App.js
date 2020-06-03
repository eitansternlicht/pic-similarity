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

const PORT = 3000;
function App() {
  const [imageDescriptions, setImageDescriptions] = useState("");
  const [results, setResults] = useState({ tfIdf: [], doc2vec: [] });
  const [searchImage, setSearchImage] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [queryTime, setQueryTime] = useState(null);
  const [ratings, setRatings] = useState({ tf_idf: 5 });
  const [clearScreen, setClearScreen] = useState(false);
  const [imageInputRef, setImageInputRef] = useState("");
  const db = firebase.firestore();

  const getURL = (hit) => {
    const { image_path, labelAnnotations } = hit._source;
    const descriptions = labelAnnotations.map((annotation) => {
      return annotation.description;
    });
    const descriptionString = descriptions.join(", ");
    return `http://localhost:${PORT}/image-storage/${image_path}`;
  };
  const onChangeFilePicker = (event) => {
    setSearchImage(event.target.files[0]);
  };
  const onClickGetSimilar = () => {
    const date1 = new Date();
    setClearScreen(false);
    setError(false);
    setLoading(true);
    console.log("onClickGetSimilar", searchImage);
    const data = new FormData();
    data.append("file", searchImage);
    axios
      .post(`http://localhost:${PORT}/upload`, data, {})
      .then((res) => {
        console.log("res", res);
        setLoading(false);
        const tfIdfResults = lens(res, "data.results.tfIdf.body.hits.hits");
        const doc2vecResults = lens(res, "data.results.doc2vec.body.hits.hits");
        console.log(JSON.stringify(tfIdfResults));
        console.log(JSON.stringify(doc2vecResults));

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
          setQueryTime(new Date() - date1);
        }
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  };

  const addVoteToFirebase = () => {
    db.collection("scores")
      .add({
        searched_image: results[0]._source.image_path,
        tf_idf: {
          user_rating: ratings.tf_idf,
          results: results.slice(1).map((result) => {
            return {
              image_path: result._source.image_path,
              labelAnnotations: result._source.labelAnnotations,
            };
          }),
        },
      })
      .then((res) => {
        setClearScreen(true);
        setImageDescriptions(null);
        setResults([]);
        setSearchImage(null);
        setRatings({ tf_idf: 5 });
        setError(false);
        setQueryTime(null);
        imageInputRef.value = null;
        console.log(res);
      })
      .catch((err) => {
        setError(err);
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
      {queryTime ? <span> Query Time: {queryTime} ms</span> : null}
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
              const url = `http://localhost:${PORT}/image-storage/${image_path}`;
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
          <VerticalSlider
            onSetSlider={(numChosen) => setRatings({ tf_idf: numChosen })}
          ></VerticalSlider>
          <h4>doc2vec results</h4>

          <Row>
            {results.doc2vec.slice(1).map((hit) => {
              const { image_path, labelAnnotations } = hit._source;
              const descriptions = labelAnnotations.map((annotation) => {
                return annotation.description;
              });
              const descriptionString = descriptions.join(", ");
              const url = `http://localhost:${PORT}/image-storage/${image_path}`;
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
          <VerticalSlider
            onSetSlider={(numChosen) => setRatings({ doc2vec: numChosen })}
          ></VerticalSlider>

          <Button
            varient="primary"
            onClick={addVoteToFirebase}
            type="submit"
            style={{}}
          >
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
}

export default App;
