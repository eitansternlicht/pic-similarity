import { SERVER_URL } from './consts';

export const toImageURL = imagename => `${SERVER_URL}/image-storage/${imagename}`;
