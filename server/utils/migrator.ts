// export const imageClassification = async pathh => {
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
