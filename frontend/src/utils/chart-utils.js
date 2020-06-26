import { average, roundTo10 } from './func-utils';

export const categoriesByTen = {
    0: '0 - 10',
    10: '10 - 20',
    20: '20 - 30',
    30: '30 - 40',
    40: '40 - 50',
    50: '50 - 60',
    60: '60 - 70',
    70: '70 - 80',
    80: '80 - 90',
    90: '90 - 100'
};

export const similarityToUserRatings = (similarityAlgorithm, docs) => {
    const results = {};
    for (const doc of docs) {
        for (const res of doc[similarityAlgorithm].results) {
            const rounded = roundTo10(res.userRating.similarityScore);
            if (rounded === 100) {
                console.log('100', res.userRating.similarityScore);
            }
            const rating = Math.floor(average(Object.values(res.userRating.ratings)));
            if (rounded in results) {
                results[rounded].push(rating);
            } else {
                results[rounded] = [rating];
            }
        }
    }
    console.log('results', results);
    return results;
};

export const docToGoogleVisionConfidence = similarityAlgorithm => doc => {
    const searchedImageConf = average(doc.searchedImage.labelAnnotations.map(a => a.score));
    return doc[similarityAlgorithm].results.map(res => ({
        x: (average(res.labelAnnotations.map(a => a.score)) * searchedImageConf * 100).toFixed(1),
        y: average(Object.values(res.userRating.ratings)).toFixed(1)
    }));
};
