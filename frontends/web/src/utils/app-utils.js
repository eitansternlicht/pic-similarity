import { IMAGE_STORAGE_BASE_URL } from './consts';

// export const toImageURL = imagename => `${SERVER_URL}/image-storage/${imagename}`;
export const toImageURL = imageFilename => {
    const [name, extention] = imageFilename.split('.');
    return `${IMAGE_STORAGE_BASE_URL}/${name}1111111111.${extention}`;
};

export const toPercentage = elasticScore => Math.round((elasticScore - 1) * 100);
