import { average } from './utils/func-utils';
import { generateRandomImagePath } from './db/image-paths';
import { queryElastic } from './db/elastic';

const AMOUNT_OF_TESTS_TO_RUN = 100000;
export const runPerformanceTests = () => {
    console.log('running performance tests');
    const queries = [];
    for (let i = 0; i < AMOUNT_OF_TESTS_TO_RUN; i++) {
        queries.push(
            queryElastic(generateRandomImagePath()).then(
                results => ({ doc2vec: results.doc2vec.body.took, tfIdf: results.tfIdf.body.took }),
                error => console.log(error)
            )
        );
    }
    Promise.all(queries).then(results => {
        const tfIdfResults = average(results.map(({ tfIdf }) => tfIdf));
        const doc2vecResults = average(results.map(({ doc2vec }) => doc2vec));

        console.log(`Finsihed running ${AMOUNT_OF_TESTS_TO_RUN} performance tests`);
        console.log('tfIdf results average query time', tfIdfResults);
        console.log('doc2vec results average query time', doc2vecResults);
    });
};
