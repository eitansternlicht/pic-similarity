# Picture Similarity Service

This is a research project as part of our B.Sc in Software Engineering.

The website is aiming to answer the following question:

Given an image, find the most similar images to it within a repository.

We take the approach of extracting word labels that describe the image and then use NLP algorithms to compute the similarity between two sets of words.

## Setup

- Clone repository

- Download elasticsearch and add the binary location to your PATH

To start server cd into `server` directory and run:
`npm install`
`npm run init-db`

## To run

In server directory run:
`npm run dev`

To start client cd into `client` directory and run:
`npm install`
`npm start`
