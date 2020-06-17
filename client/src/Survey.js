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
const SERVER_URL = `http://localhost:${SERVER_PORT}/random`;

export const Survey = () => {
  const [imageDescriptions, setImageDescriptions] = useState("");
  const [results, setResults] = useState({ tfIdf: [], doc2vec: [] });
  const [searchImage, setSearchImage] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [queryTime, setQueryTime] = useState(null);
  const [ratings, setRatings] = useState({ tfIdf: 5, doc2vec: 5 });
  const [clearScreen, setClearScreen] = useState(false);
  const [imageInputRef, setImageInputRef] = useState("");
  const db = firebase.firestore();

  const getURL = (hit) => {
    const { image_path, labelAnnotations } = hit._source;
    const descriptions = labelAnnotations.map((annotation) => {
      return annotation.description;
    });
    const descriptionString = descriptions.join(", ");
    return `http://localhost:${SERVER_PORT}/image-storage/${image_path}`;
  };
  const onChangeFilePicker = (event) => {
    setSearchImage(event.target.files[0]);
  };
  const onClickGetSimilar = () => {
    const date1 = new Date();
    setClearScreen(false);
    setError(false);
    setLoading(true);
    axios
      .get(SERVER_URL)
      .then((res) => {
        console.log("res", res);
        setLoading(false);
        const tfIdfResults = lens(res, "data.tfIdf.body.hits.hits");
        const doc2vecResults = lens(res, "data.doc2vec.body.hits.hits");
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
    console.log("ratings", ratings);
    db.collection("scores")
      .add({
        searched_image: results.tfIdf[0]._source.image_path,
        tfIdf: {
          user_rating: ratings.tfIdf,
          results: results.tfIdf.slice(1).map((result, i) => {
            return {
              image_path: result._source.image_path,
              labelAnnotations: result._source.labelAnnotations,
              user_rating: ratings,
            };
          }),
        },
        doc2vec: {
          user_rating: ratings.doc2vec,
          results: results.doc2vec.slice(1).map((result) => {
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
        setRatings({ tfIdf: 5, doc2vec: 5 });
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
    <Container fluid>
      <h1>Pic Similarity Service - Survey</h1>
      <Button
        varient="primary"
        onClick={onClickGetSimilar}
        type="submit"
        style={{ marginRight: 10 }}
      >
        Get Random
      </Button>
      {queryTime ? <span> Query Time: {queryTime} ms</span> : null}
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
                <Card key={image_path} style={{ width: "18rem" }}>
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
          <Row>
            <VerticalSlider
              onSetSlider={(numChosen) =>
                setRatings({ ...ratings, tfIdf: Number.parseInt(numChosen) })
              }
            ></VerticalSlider>
            <VerticalSlider
              onSetSlider={(numChosen) =>
                setRatings({ ...ratings, tfIdf2: Number.parseInt(numChosen) })
              }
            ></VerticalSlider>{" "}
            <VerticalSlider
              onSetSlider={(numChosen) =>
                setRatings({ ...ratings, tfIdf3: Number.parseInt(numChosen) })
              }
            ></VerticalSlider>{" "}
            <VerticalSlider
              onSetSlider={(numChosen) =>
                setRatings({ ...ratings, tfIdf4: Number.parseInt(numChosen) })
              }
            ></VerticalSlider>{" "}
            <VerticalSlider
              onSetSlider={(numChosen) =>
                setRatings({ ...ratings, tfIdf5: Number.parseInt(numChosen) })
              }
            ></VerticalSlider>
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
                <Card key={image_path} style={{ width: "18rem" }}>
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
          <Row>
            <VerticalSlider
              onSetSlider={(numChosen) =>
                setRatings({ ...ratings, doc2vec: Number.parseInt(numChosen) })
              }
            ></VerticalSlider>
            <VerticalSlider
              onSetSlider={(numChosen) =>
                setRatings({ ...ratings, doc2vec2: Number.parseInt(numChosen) })
              }
            ></VerticalSlider>{" "}
            <VerticalSlider
              onSetSlider={(numChosen) =>
                setRatings({ ...ratings, doc2vec3: Number.parseInt(numChosen) })
              }
            ></VerticalSlider>{" "}
            <VerticalSlider
              onSetSlider={(numChosen) =>
                setRatings({ ...ratings, doc2vec4: Number.parseInt(numChosen) })
              }
            ></VerticalSlider>{" "}
            <VerticalSlider
              onSetSlider={(numChosen) =>
                setRatings({ ...ratings, doc2vec5: Number.parseInt(numChosen) })
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
