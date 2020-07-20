import { Client } from '@elastic/elasticsearch';
const ELASTIC_DB_NAME = 'labels';

const client = new Client({
    node: 'http://localhost:9200/'
});

const querySimilarity = (
    elasticSimilarityFunction: string,
    elasticDocVectorFieldName: string,
    size: number,
    queryVector: any
) =>
    client.search({
        index: ELASTIC_DB_NAME,
        size,
        body: {
            query: {
                function_score: {
                    query: { match_all: {} },
                    script_score: {
                        script: {
                            source: `${elasticSimilarityFunction}(params.queryVector, doc['${elasticDocVectorFieldName}']) + 1.0`,
                            params: {
                                queryVector
                            }
                        }
                    }
                }
            }
        }
    });

const queryExact = (imageFilename: string) =>
    client.search({
        index: ELASTIC_DB_NAME,
        body: {
            query: {
                constant_score: {
                    filter: {
                        term: {
                            image_path: imageFilename
                        }
                    }
                }
            }
        }
    });

const removedSearchedImage = (searchImage: string, results) => {
    const filteredHits = results.body.hits.hits.filter(hit => hit._source.image_path !== searchImage);
    if (filteredHits.length !== results.body.hits.hits.length) {
        results.body.hits.hits = filteredHits;
        return results;
    }
    results.body.hits.hits = results.body.hits.hits.slice(0, results.length - 1);
    return results;
};

export const queryElastic = async (searchImage: string) => {
    const searchedImage = await queryExact(searchImage);
    const { tfIdf_vector, doc2vec_vector } = searchedImage.body.hits.hits[0]._source;
    const tfIdfResults = await querySimilarity('cosineSimilaritySparse', 'tfIdf_vector', 6, tfIdf_vector);
    const doc2vecResults = await querySimilarity('cosineSimilarity', 'doc2vec_vector', 6, doc2vec_vector);
    return {
        searchedImage,
        tfIdf: removedSearchedImage(searchImage, tfIdfResults),
        doc2vec: removedSearchedImage(searchImage, doc2vecResults)
    };
};

export const queryElasticByVectors = async ({ tfIdfVector, doc2vecVector }) => {
    try {
        const tfIdfResults = await querySimilarity('cosineSimilaritySparse', 'tfIdf_vector', 5, tfIdfVector);
        const doc2vecResults = await querySimilarity('cosineSimilarity', 'doc2vec_vector', 5, doc2vecVector);
        return {
            tfIdf: tfIdfResults,
            doc2vec: doc2vecResults
        };
    } catch (e) {
        console.log('errrrr', e);
    }
};
