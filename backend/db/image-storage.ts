import { join } from 'path';
const IMAGE_STORAGE_ROOT = 'static';
const IMAGE_STORAGE_FULL_PREFIX = join(IMAGE_STORAGE_ROOT, 'image-storage');

export const makeUrl = (imageFileName: string) => join(IMAGE_STORAGE_FULL_PREFIX, imageFileName);
