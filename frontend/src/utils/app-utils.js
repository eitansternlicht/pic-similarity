import { SERVER_URL } from './consts';

export const toImageURL = imagename => `${SERVER_URL}/image-storage/${imagename}`;

export const toPercentage = elasticScore => Math.round((elasticScore - 1) * 100);
