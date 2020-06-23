import { average, mapValues, roundTo10 } from './func-utils';

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
            if (rounded in results) {
                results[rounded].push(res.userRating.rating);
            } else {
                results[rounded] = [res.userRating.rating];
            }
        }
    }
    return results;
};
