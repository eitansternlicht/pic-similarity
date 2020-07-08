import { readFileSync, writeFileSync } from 'fs';

import { frequencies } from '../utils/func-utils';
import path from 'path';

// termToIdf = {"elephant": 23, "sky": 501, ...}
// idToTerm = {"0": "elaphant", "1": "sky", ...}
// old tf_vector = {"0": 0.06, "50": 0.9}
// tfIdf_vector = {"0": 0.06 * idf["0"], "50": 0.9 * idf["50"]}

const STOP_WORDS = new Set([
    '',
    'a',
    'an',
    'and',
    '&',
    'are',
    'as',
    'at',
    'be',
    'but',
    'by',
    'for',
    'if',
    'in',
    'into',
    'is',
    'it',
    'no',
    'not',
    'of',
    'on',
    'or',
    'such',
    'that',
    'the',
    'their',
    'then',
    'there',
    'these',
    'they',
    'this',
    'to',
    'was',
    'will',
    'with'
]);

export const readJSON = (oldJsonPath: string) => {
    return JSON.parse(
        '[' +
            readFileSync(oldJsonPath)
                .toString()
                .split('\n')
                .join(',') +
            ']'
    );
};
// writeJSON(dataDocs, '../new-data.json');
// dataDocs = [{...}, {...}]
// wanted = "{..., ...}\n{.., .....}\n"
// stringify(dataDocs) = "[{.., ...}, {...}]"
// newDataDocs = ["{.., ...}", "{...}"]
// [1, 2, 3].join("\n")
export const writeJSON = (dataDocs: DataDoc[], newJsonPath: string): void => {
    const s = dataDocs.map(doc => JSON.stringify(doc)).join('\n');
    writeFileSync(newJsonPath, s);
};

export const addDocVectors = (docs: DataDoc[], docVectors: number[][]) => {
    for (let i = 0; i < docs.length; i++) {
        docs[i]._source['doc2vec_vector'] = docVectors[i];
    }
};
// idf(term) = log(numOfDocs/docsWithTerm(term))

// adds a TF-IDF sparse vector to each doc
// returns a dictionary from a sparse vector ID to each term
export const addTfIdfVector = (docs: DataDoc[]): { [key in SparseVectorID]: Term } => {
    const numOfDocs = docs.length;
    const allTerms: Set<Term> = new Set([]);
    const termToDocSet: { [key in Term]: Set<DocID> } = {};
    const docToTfVector: { [key in DocID]: { [key in Term]: number } } = {};
    for (const doc of docs) {
        doc._source['image_path'] = path.win32.basename(doc._source['Image path']);
        delete doc._source['Image path'];
        const docTerms = [];
        for (const phraseObj of doc._source.labelAnnotations) {
            const terms = toTerms(phraseObj.description);
            addValues(allTerms, terms);
            docTerms.push(...terms);
            for (const term of terms) {
                if (termToDocSet[term]) {
                    termToDocSet[term].add(doc._id);
                } else {
                    termToDocSet[term] = new Set([doc._id]);
                }
            }
        }
        const freqs = frequencies(docTerms);
        const tf_vector = Object.fromEntries(
            Object.entries(freqs).map(([term, freq]) => [term, freq / docTerms.length])
        );
        docToTfVector[doc._id] = tf_vector;
    }

    const termToIdf = Object.fromEntries(
        Object.entries(termToDocSet).map(([term, setOfDocs]) => [term, Math.log10(numOfDocs / setOfDocs.size)])
    );
    // create dictionary
    const sortedTerms = Array.from(allTerms).sort(); // ["a", "b", "c"]
    // console.log('sortedTerms', sortedTerms.slice(0, 50));
    // ["a", "b", "c"] => {"0": "a", "1": "b", "2": "c"}
    const termToId = Object.fromEntries(sortedTerms.map((term, i) => [term, '' + i]));

    // adds a TF-IDF sparse vector to each doc
    for (const doc of docs) {
        const termToTfIdf = tf_to_tfIdf(termToIdf, docToTfVector[doc._id]);
        const sparseVecTfIdf = Object.fromEntries(
            Object.entries(termToTfIdf).map(([term, tfIdf]) => [termToId[term], tfIdf])
        );
        delete doc._source.tf_vector;
        doc._source['tfIdf_vector'] = sparseVecTfIdf;
    }
    return flip(termToId);
};

export const initTfIdfData = (docs: DataDoc[]) => {
    const numOfDocs = docs.length;
    const allTerms: Set<Term> = new Set([]);
    const termToDocSet: { [key in Term]: Set<DocID> } = {};
    // const docToTfVector: { [key in DocID]: { [key in Term]: number } } = {};
    for (const doc of docs) {
        const docTerms = [];
        for (const phraseObj of doc._source.labelAnnotations) {
            const terms = toTerms(phraseObj.description);
            addValues(allTerms, terms);
            docTerms.push(...terms);
            for (const term of terms) {
                if (termToDocSet[term]) {
                    termToDocSet[term].add(doc._id);
                } else {
                    termToDocSet[term] = new Set([doc._id]);
                }
            }
        }
        // const freqs = frequencies(docTerms);
        // const tf_vector = Object.fromEntries(
        //     Object.entries(freqs).map(([term, freq]) => [term, freq / docTerms.length])
        // );
        // docToTfVector[doc._id] = tf_vector;
    }

    const termToIdf = Object.fromEntries(
        Object.entries(termToDocSet).map(([term, setOfDocs]) => [term, Math.log10(numOfDocs / setOfDocs.size)])
    );
    // create dictionary
    const sortedTerms = Array.from(allTerms).sort(); // ["a", "b", "c"]
    // console.log('sortedTerms', sortedTerms.slice(0, 50));
    // ["a", "b", "c"] => {"0": "a", "1": "b", "2": "c"}
    const termToId = Object.fromEntries(sortedTerms.map((term, i) => [term, '' + i]));

    // adds a TF-IDF sparse vector to each doc
    // for (const doc of docs) {
    //     const termToTfIdf = tf_to_tfIdf(termToIdf, docToTfVector[doc._id]);
    //     const sparseVecTfIdf = Object.fromEntries(
    //         Object.entries(termToTfIdf).map(([term, tfIdf]) => [termToId[term], tfIdf])
    //     );
    //     delete doc._source.tf_vector;
    //     doc._source['tfIdf_vector'] = sparseVecTfIdf;
    // }
    return { termToId, termToIdf };
};

export const toTerms = (str: string): string[] =>
    str
        .toLowerCase()
        .replace(',', ' ')
        .split(' ')
        .filter(word => !STOP_WORDS.has(word));

export type DocID = string;
export type SparseVectorID = string;
export type Term = string;
export type DataDoc = {
    _id: DocID;
    _source: {
        'Image path': string;
        labelAnnotations: {
            mid: string;
            description: string;
        }[];
        tf_vector: {
            [key in SparseVectorID]: number;
        };
    };
};
export type DictionaryDoc = {
    _id: SparseVectorID;
    _source: {
        term: Term;
    };
};

export const makeIdToTerm = (dictionaryDocs: DictionaryDoc[]): { [key in SparseVectorID]: Term } =>
    Object.fromEntries(dictionaryDocs.map(doc => [doc._id, doc._source.term]));

export const tf_to_tfIdf = (
    termToIdf: { [key in Term]: number },
    tf_vector: { [key in Term]: number }
): { [key in Term]: number } =>
    Object.fromEntries(Object.entries(tf_vector).map(([term, tf]) => [term, tf * termToIdf[term]]));

export const add_tfIdf_vectors = (termToIdf: { [key in Term]: number }, docs: DataDoc[]): void => {
    for (const doc of docs) {
        doc._source['tfIdf_vector'] = tf_to_tfIdf(termToIdf, doc._source.tf_vector);
    }
};

function addValues<T>(set: Set<T>, values: T[]): void {
    values.forEach(value => set.add(value));
}

const flip = obj => Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));

// e const imageClassification = async pathh => {
//     const corpusPath = '/Users/roisulimani/Desktop';
//     readdir(corpusPath, (e, paths) => {
//         console.log(
//             paths
//                 .filter(path => path[0] !== '.')
//                 .map(path => corpusPath + '/' + path)
//         );
//     });
// };

// export const toESjson = oldJsonPath => {
//     const fileBuffer = readFileSync(oldJsonPath);
//     const oldJSON = JSON.parse(fileBuffer);
//     const newJSON = Object.keys(oldJSON).map(imagePath => {
//         const descriptions = oldJSON[imagePath];
//         return {
//             _index: 'mock_descriptions',
//             _type: '_doc',
//             _id: imagePath,
//             _score: 1,
//             _source: { descriptions },
//         };
//     });

//     writeFileSync('newresults.json', newJSON.map(JSON.stringify).join(''));
// };

// export const imagesClassification = corpusPath => {
//     readdir(corpusPath, (e, paths) => {
//         const fullPaths = paths
//             .filter(path => path[0] !== '.')
//             .map(path => corpusPath + '/' + path);
//         load().then(mobilenetModel => {
//             const promises = fullPaths.map(fullPath => {
//                 const image = readImage(fullPath);
//                 return mobilenetModel
//                     .classify(image)
//                     .then(predictions => {
//                         console.log(fullPath);
//                         console.log('pred', predictions);
//                         return [basename(fullPath), predictions];
//                     })
//                     .catch(e => {
//                         console.log('error: ', e);
//                         return [basename(fullPath), e];
//                     });
//             });
//             Promise.all(promises)
//                 .then(results => {
//                     res = {};
//                     for (const result of results) {
//                         res[result[0]] = result[1];
//                     }
//                     writeFileSync('results.json', JSON.stringify(res));
//                 })
//                 .catch(e => {
//                     console.log('error in promise.all: ', e);
//                 });
//         });
//     });
// };

// exports = { imageClassification, imagesClassification, toESjson };

// const dataDocs: DataDoc[] = readJSON('../data.json');
// const image_paths = dataDocs.map(doc =>
//     path.win32.basename(doc._source['Image path'])
// );
// writeFileSync('image_paths.txt', image_paths.join('\n'));

export const addDocVectorsToData = (docVectorsFilename: string, dataDocsFilename: string, outputFilename: string) => {
    const docsVectors = JSON.parse(readFileSync(docVectorsFilename).toString());
    const dataDocs: DataDoc[] = readJSON(dataDocsFilename);
    addDocVectors(dataDocs, docsVectors);
    // const idToTerm = addTfIdfVector(dataDocs);
    writeJSON(dataDocs, outputFilename);
};

// console.log('dataDocs[0]', dataDocs[0]);
// console.log('idToTerm["0"]', idToTerm["0"]);
// console.log('idToTerm["0"]', idToTerm["1"]);

// const dictionary = readJSON('dictionary.json');
// console.log('dictionary[0] = ', dictionary[0])
// const idToTerm = makeIdToTerm(dictionary);
// console.log('idToTerm', idToTerm)
// const idfMap = toIdfMap(dataDocs);
// add_tfIdf_vectors(idToTerm, idfMap, dataDocs);
// console.log(JSON.stringify(data[0]))
// console.log('newDataDocs', dataDocs[0]);
// console.log('idToTerm[4]', idToTerm[4]);
// console.log('idfMap[leisur]', idfMap['leisure']);

export const createDocTokensFile = (docsFile: string, outputDocTokensFile: string) => {
    const dataDocs: DataDoc[] = readJSON(docsFile);
    const docsTokens: string[][] = dataDocs.map(dataDoc => {
        return dataDoc._source.labelAnnotations.map(annotation => {
            return annotation.description;
        });
    });
    const doc2vecInputFile: string = docsTokens.map(docTokens => docTokens.flatMap(toTerms).join(' ')).join('\n');
    writeFileSync(outputDocTokensFile, doc2vecInputFile);
};

export const labelAnnotationsToTerms = (labelAnnotations: { description: string }[]) =>
    labelAnnotations.flatMap(({ description }) => toTerms(description));
// console.log(docsVectors);

// classifyImage(imagePath).then(predictions => {
//     if (predictions && predictions.length > 1) {
//         const descriptions = predictions[0].className;
//         console.log('searching for ', descriptions);
//         client
//             .search({
//                 index: 'image_descriptions',
//                 body: {
//                     query: {
//                         match: { descriptions },
//                     },
//                 },
//             })
//             .then(result => {
//                 // console.log('result', result);
//                 res.json({
//                     elasticSearchResult: result,
//                     imageDescriptions: descriptions,
//                 });
//                 // res.send('' + JSON.stringify(result));
//             })
//             .catch(reason => console.log('error', reason));
//     }
//     // console.log('predictions after', predictions);
//     // res.json(predictions);
// });
//     } else throw new Error('error');
// });

// const bla = () => {
// console.log('results', tensorflowResults);
// const b = Object.keys(tensorflowResults).map(filename => ({
//     filename,
//     descriptions: tensorflowResults[filename][0].className
//         .split(', ')
//         .join(','),
// }));
// const s = JSON.stringify(b);
// const fileBuffer = readFileSync('tensorflow-results-naive.json');
// const oldJSON = JSON.parse(fileBuffer);
// const newJSON = oldJSON.map(imageObj => {
//     return {
//         _index: 'image_descriptions',
//         _type: '_doc',
//         _id: imageObj.filename,
//         _score: 1,
//         _source: imageObj,
//     };
// });
// writeFileSync(
//     'tensorflow-results-naive2.json',
//     newJSON.map(JSON.stringify).join('')
// );
// };
