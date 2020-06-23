import { readFileSync } from 'fs';

const imagePaths: string[] = readFileSync('db/image-paths.txt')
    .toString()
    .split('\n');

export const generateRandomImagePath = (): string => imagePaths[Math.floor(Math.random() * imagePaths.length)];
