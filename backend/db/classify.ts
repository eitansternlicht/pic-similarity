import { readFileSync, readdir, writeFileSync } from 'fs';

import { load } from '@tensorflow-models/mobilenet';
import { node } from '@tensorflow/tfjs-node';
import tf from '@tensorflow/tfjs';

const readImage = (path: string): tf.Tensor3D => {
    const imageBuffer = readFileSync(path);
    const tfimage = node.decodeImage(imageBuffer);
    return tfimage as tf.Tensor3D;
};

export const classifyImage = async (
    imagePath: string
): Promise<{
    className: string;
    probability: number;
}[]> => {
    const image = readImage(imagePath);
    const mobilenetModel = await load();
    const predictions = await mobilenetModel.classify(image);
    return predictions;
};
