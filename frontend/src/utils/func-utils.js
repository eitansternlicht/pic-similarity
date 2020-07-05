export const lens = (obj, path) => path.split('.').reduce((o, key) => (o && o[key] ? o[key] : null), obj);

export const updateArray = (array, indexToSet, valueToSet) => {
    const newArray = [...array];
    newArray[indexToSet] = valueToSet;
    return newArray;
};

export const roundTo10 = number => (number === 100 ? 90 : Math.floor(number / 10) * 10);

export const mapValues = (f, obj) => Object.fromEntries(Object.entries(obj).map(([key, val]) => [key, f(val)]));

export const sum = arrayOfNums => {
    let total = 0;
    for (const num of arrayOfNums) {
        total += num;
    }
    return total;
};
export const average = arrayOfNums => {
    if (!arrayOfNums) {
        return undefined;
    }
    return sum(arrayOfNums) / arrayOfNums.length;
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

export const uppercaseWord = string => (string ? string[0].toUpperCase() + string.slice(1) : '');

export const intersection = (arr1, arr2) => {
    const set2 = new Set(arr2);
    return arr1.filter(e => set2.has(e));
};
