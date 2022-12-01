#! /usr/local/opt/node@14/bin/node

const data = [];
let input = "";

const n = parseInt(process.argv[2], 10) || 2;
console.log("N=", n);
const nSplit = n / 2 >>> 0 ;

const goal = 2020;
const splitGoal = goal / n >>> 0;

const binarySearch = (arr = [], f) => {
    if (arr.length < 2) {
        return arr[0];
    }
    const idx = arr.length / 2 >>> 0;
    const v = arr[idx];
    // console.log(idx, v, f);
    if (v > f) {
        return binarySearch(arr.slice(0, idx), f);
    } else if (v < f) {
        return binarySearch(arr.slice(idx, arr.length), f);
    }
    return f;
}

const stream = process.stdin;
stream.on('data', (buf) => {
    data.push(buf);
});
stream.on('end', () => {
    input = Buffer.concat(data).toString();

    const valueString = input.split("\n");
    const value = valueString.map((v) => {
        const i = parseInt(v, 10);
        return i <= goal ? i : undefined;
    }).filter((v) => !!v);
    const valSorted = value.sort((a, b) => a - b);

    const valuePivot = binarySearch(valSorted, splitGoal);
    const vIdx = valSorted.findIndex((v) => v === valuePivot);
    const vIdxOffset = vIdx + 1 <= valSorted.length ? vIdx + 1 : vIdx;
    // console.log(valuePivot);

    const valueSplit = [
        valSorted.slice(0, vIdxOffset),
        valSorted.slice(vIdxOffset, valSorted.length)
    ];

    const shortestArr = valueSplit[0].length > valueSplit[1].length ? valueSplit[1] : valueSplit[0];
    const longestArr = valueSplit[0].length > valueSplit[1].length ? valueSplit[0] : valueSplit[1]

    shortestArr.forEach((v) => {

        const r = binarySearch(longestArr, goal - v);
        if (goal === r + v) {
            console.log("FOUND", r, v, r * v);
        }
    });

    shortestArr.forEach((v) => {
        
        shortestArr.forEach((d) => {

            const r = binarySearch(longestArr, goal - (v + d));
            if (goal === r + v + d) {
                console.log("FOUND", r, v, d, r * v * d);
            }

        });
    });
});
