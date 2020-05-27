import {readFileSync, writeFileSync} from "fs"
import path from "path"

// termToIdf = {"elephant": 23, "sky": 501, ...}
// idToTerm = {"0": "elaphant", "1": "sky", ...}
// old tf_vector = {"0": 0.06, "50": 0.9}
// tfIdf_vector = {"0": 0.06 * idf["0"], "50": 0.9 * idf["50"]}

const STOP_WORDS = new Set([
    "", "a", "an", "and", "&", "are", "as", "at", "be", "but", "by",
    "for", "if", "in", "into", "is", "it",
    "no", "not", "of", "on", "or", "such",
    "that", "the", "their", "then", "there", "these",
    "they", "this", "to", "was", "will", "with"
])

export const readJSON = (oldJsonPath: string) => {
    const fileBuffer = readFileSync(oldJsonPath);
    return JSON.parse(fileBuffer.toString());
};
// writeJSON(dataDocs, '../new-data.json');
// dataDocs = [{...}, {...}]
// wanted = "{..., ...}\n{.., .....}\n"
// stringify(dataDocs) = "[{.., ...}, {...}]"
// newDataDocs = ["{.., ...}", "{...}"]
// [1, 2, 3].join("\n") 
export const writeJSON = (dataDocs: DataDoc[], newJsonPath: string): void => {
    const s = dataDocs.map(doc => JSON.stringify(doc)).join("\n")
    writeFileSync(newJsonPath, s);
}

// idf(term) = log(numOfDocs/docsWithTerm(term))

// adds a TF-IDF sparse vector to each doc
// returns a dictionary from a sparse vector ID to each term
export const addTfIdfVector = (docs: DataDoc[]): {[key in SparseVectorID]: Term} => {
    const numOfDocs = docs.length;
    const allTerms: Set<Term> = new Set([]);
    const termToDocSet: { [key in Term]: Set<DocID> } = {};
    const docToTfVector: { [key in DocID]: { [key in Term]: number } } = {};
    for (const doc of docs) {
        doc._source["image_path"] = path.win32.basename(doc._source["Image path"])
        delete doc._source["Image path"];
        const docTerms = []
        for (const phraseObj of doc._source.labelAnnotations) {
            const terms = toTerms(phraseObj.description);
            addValues(allTerms, terms)
            docTerms.push(...terms)
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
    const termToId = Object.fromEntries(sortedTerms.map((term, i) => [term, "" + i]));

    // adds a TF-IDF sparse vector to each doc
    for (const doc of docs) {
        const termToTfIdf = tf_to_tfIdf(
            termToIdf,
            docToTfVector[doc._id]
        );
        const sparseVecTfIdf = Object.fromEntries(
            Object.entries(termToTfIdf).map(([term, tfIdf]) => [termToId[term], tfIdf])
        )
        delete doc._source.tf_vector;
        doc._source['tfIdf_vector'] = sparseVecTfIdf;
    }
    return flip(termToId);
}
        
export const toTerms = (str: string): string[] => 
    str.toLowerCase().replace(",", " ").split(" ").filter((word) => !STOP_WORDS.has(word))

export type DocID = string
export type SparseVectorID = string
export type Term = string
export type DataDoc = {
    _id: DocID;
    _source: {
        "Image path": string;
        labelAnnotations: {
            mid: string;
            description: string;
        }[];
        tf_vector: {
            [key in SparseVectorID]: number
        }
    };
};
export type DictionaryDoc = {
    _id: SparseVectorID;
    _source: {
        term: Term;
    }
}

export const makeIdToTerm = (dictionaryDocs: DictionaryDoc[]): {[key in SparseVectorID]: Term} =>
    Object.fromEntries(dictionaryDocs.map((doc) => [doc._id, doc._source.term]));

export const tf_to_tfIdf = (
           termToIdf: { [key in Term]: number },
           tf_vector: { [key in Term]: number }
       ): {[key in Term]: number} =>
           Object.fromEntries(
               Object.entries(tf_vector).map(([term, tf]) => [
                   term,
                   tf * termToIdf[term],
               ])
           );

export const add_tfIdf_vectors = (
    termToIdf: { [key in Term]: number },
           docs: DataDoc[]
       ): void => {
           for (const doc of docs) {
               doc._source['tfIdf_vector'] = tf_to_tfIdf(
                   termToIdf,
                   doc._source.tf_vector
               );
           }
       };

// frequencies([100, 200, 300, 100]) = {100: 2, 200: 1, 300: 1}
const frequencies = (arr: any[]): {[key in any]: number} => {
    const freqs = {};
    for (const elem of arr) {
        if (freqs[elem]) {
            freqs[elem] += 1;
        } else {
            freqs[elem] = 1;
        }
    }
    return freqs;
}

function addValues<T>(set: Set<T>, values: T[]): void {
    values.forEach(value => set.add(value));
};

const flip = obj => Object.fromEntries(Object.entries(obj).map(([k, v]) => ([v, k])))

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
