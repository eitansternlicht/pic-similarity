export const lens = (obj, path) => path.split('.').reduce((o, key) => (o && o[key] ? o[key] : null), obj);

export const updateArray = (array, indexToSet, valueToSet) => {
    const newArray = [...array];
    newArray[indexToSet] = valueToSet;
    return newArray;
};
