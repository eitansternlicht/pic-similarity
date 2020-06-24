export const lens = (obj, path) => path.split('.').reduce((o, key) => (o && o[key] ? o[key] : null), obj);

export const updateArray = (array, indexToSet, valueToSet) => {
    const newArray = [...array];
    newArray[indexToSet] = valueToSet;
    return newArray;
};

export const roundTo10 = number => (number === 100 ? 90 : Math.round(number / 10) * 10);

export const mapValues = (f, obj) => Object.fromEntries(Object.entries(obj).map(([key, val]) => [key, f(val)]));

export const average = arrayOfNums => {
    if (!arrayOfNums) {
        return undefined;
    }
    let total = 0;
    for (var i = 0; i < arrayOfNums.length; i++) {
        total += arrayOfNums[i];
    }
    return total / arrayOfNums.length;
};

export const frequencies = array => {
    const map = {};
    for (const elem of array) {
        if (map.hasOwnProperty(elem)) {
            map[elem]++;
        } else {
            map[elem] = 1;
        }
    }
    return map;
};
