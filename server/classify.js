const tf = require('@tensorflow/tfjs');
const mobilenet = require('@tensorflow-models/mobilenet');
const tfnode = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path')

const readImage = path => {
    const imageBuffer = fs.readFileSync(path);
    const tfimage = tfnode.node.decodeImage(imageBuffer);
    return tfimage;
  }

   const imageClassification = async pathh => {
    // const image = readImage(path);
    // const mobilenetModel = await mobilenet.load();
    // const predictions = await mobilenetModel.classify(image);
    // console.log('Classification Results:', predictions);
    // return predictions;
    // console.log(path.basename(pathh));
    const corpusPath = "/Users/roisulimani/Desktop";
    fs.readdir(corpusPath, ((e, paths) => {
        console.log(paths.filter(path => path[0] !== '.').map(path => corpusPath + "/" + path));
    }));
  }

  const toESjson = oldJsonPath => {
      const fileBuffer = fs.readFileSync(oldJsonPath);
      const oldJSON = JSON.parse(fileBuffer);
      const newJSON = Object.keys(oldJSON).map(imagePath => {
        const descriptions = oldJSON[imagePath];
        return {
            _index:"mock_descriptions",
            _type:"_doc",
            _id: imagePath,
            _score:1,
            _source: { descriptions}}
      });
      
      fs.writeFileSync("newresults.json", newJSON.map(JSON.stringify).join(""));
  } 


  const imagesClassification = corpusPath => {
    fs.readdir(corpusPath, ((e, paths) => {
        const fullPaths =  paths.filter(path => path[0] !== '.').map(path => corpusPath + "/" + path)
        mobilenet.load().then(mobilenetModel => {
            const promises = fullPaths.map(fullPath => {
                const image = readImage(fullPath);
                return mobilenetModel.classify(image).then(predictions => {
                    console.log(fullPath);
                    console.log("pred", predictions)
                    return [path.basename(fullPath), predictions];
                }).catch(e => {
                    console.log("error: ", e);
                    return [path.basename(fullPath), e];
                });
            });
            Promise.all(promises).then(results => {
                res = {}
                for (const result of results) {
                    res[result[0]] = result[1];
                }
                fs.writeFileSync("results.json", JSON.stringify(res));
            }).catch(e => { 
                console.log("error in promise.all: ", e);
            });
        });
    }));
}
        

  

  exports.imagesClassification = imagesClassification;
  exports.imageClassification = imageClassification;
  exports.toESjson = toESjson;