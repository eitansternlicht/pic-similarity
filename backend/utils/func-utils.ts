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

// frequencies([100, 200, 300, 100]) = {100: 2, 200: 1, 300: 1}
export const frequencies = (arr: any[]): { [key in any]: number } => {
    const freqs = {};
    for (const elem of arr) {
        if (freqs[elem]) {
            freqs[elem] += 1;
        } else {
            freqs[elem] = 1;
        }
    }
    return freqs;
};
