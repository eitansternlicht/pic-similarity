export const sum = (arrayOfNums: number[]) => {
    let total = 0;
    for (const num of arrayOfNums) {
        total += num;
    }
    return total;
};

export const average = (arrayOfNums: number[]) => {
    if (!arrayOfNums) {
        return undefined;
    }
    return sum(arrayOfNums) / arrayOfNums.length;
};
