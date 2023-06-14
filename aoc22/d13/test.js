const fs = require('fs');

const compare = (left, right) => {
    
    if (typeof left === 'number' && typeof right !== 'number') left = [left];
    else if (typeof left !== 'number' && typeof right === 'number') right = [right];

    for (let i = 0; i < left.length; i++) {

        if (right[i] === undefined) return false;
        else if (left[i] === right[i]) continue;
        else if (typeof left[i] === 'number' && typeof right[i] === 'number') return left[i] < right[i];
        else {
            const res = compare(left[i], right[i]);
            if (res !== null) return res;
        }
    }
    if (right.length > left.length) return true;
    return null;
}

const file = fs.readFileSync('d13/input', 'utf8');
const ans = file.split('\n\n').map((pair, i) => compare(...pair.split('\n').map(JSON.parse)) ? (i + 1): 0)
console.debug(ans, ans.reduce((pv, cv) => pv + cv, 0));

const v2 = (a, b) => {

    if (a === undefined && b === undefined) return -1;
    if (b === undefined) return false;
    if (typeof a === "number" && typeof b === "number") {
        return a <= b;
    }

    a = Array.isArray(a) ? a : [a];
    b = Array.isArray(b) ? b : [b];

    const res = a.map((value, idx) => value === b[idx] ? -1 : v2(value, b[idx]));
    const res2 = Math.abs(res.reduce((pv, cv, idx) => {
        if(idx === 0) {
            return cv;
        } else if (pv === -1) {
            return cv;
        }
        return pv;
        // if (pv === -1) {
        //     return cv;
        // }
        // return pv;

    }, -1)); // -1 for equal value at the end
    return res2;
}

const parsed = (file + '\n').split("\n\n").map((v) => v.split("\n").map((d) => eval(d)));
const res = parsed.map(([left, right], idx) => {
    
    if (idx === 140-1 || idx === 142-1) {
        console.log(JSON.stringify(left))
        console.log(JSON.stringify(right));
    }

    return v2(left, right) ? idx + 1 : 0;
});

console.log("response", res, res.reduce((pv, cv) => pv + cv, 0));

console.dir(ans.map((v, idx) => v === res[idx] ? 0 : [v,res[idx]]).filter((v) => v));

console.log(v2([[[2,[],[8,4,8,7],3,[1]],3,6,2],[]], [[[],[[],1,6],0],[10,8,7,[[6,3],[3,7],4,10,8]]]))
console.log(v2([2,[],[8,4,8,7],3,[1]], []));

console.log(v2([[],[1,10,5,[4,[0,9,1,1]],[[9,3,6,1],10,4,3,5]],[10,8,[5]],[1,[6]],[1,[[5,9],[],5,[]]]], [[]]));
