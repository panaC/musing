
import { readFileSync } from 'node:fs';
import { exit } from 'process';

let safeReports = 0;


//const file = readFileSync("test.txt", {encoding: "utf-8"});
const file = readFileSync("input.txt", {encoding: "utf-8"});

const lines = file.trim().split("\n")

for (const line of lines) {
  const numbers = line.split(" ").map((v) => parseInt(v, 10));

  const tuple = (nb) => {

    const tuple = [];
    for (let i = 1; i < nb.length; i++) {
      tuple.push(nb[i]-nb[i-1]);
    }
    return tuple;
  }


  const goods = (t) => t.
    map(v => v !== 0 && Math.sign(v) === Math.sign(t[0]) && Math.abs(v) > 0 && Math.abs(v) <= 3);

  if (goods(tuple(numbers)).every(v => !!v)) {

    safeReports+=1;
  } else {

    // bruteforce
    // O(n)

    for (let i = 0; i < numbers.length; i++) {

      const toleranceNumbers =  [...numbers.slice(0, i), ...numbers.slice(i + 1, numbers.length)];

      if (goods(tuple(toleranceNumbers)).every(v => !!v)) {
        safeReports+=1;
        break;
      }
    }
  }
}

console.log(safeReports);


