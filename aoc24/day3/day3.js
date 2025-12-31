
import { readFileSync } from 'node:fs';

//let file = readFileSync("test1.txt", {encoding: "utf-8"});
const file = readFileSync("input.txt", {encoding: "utf-8"});

{
  //console.log(file);
  const matches = [...file.matchAll(/mul\([0-9]{1,3},[0-9]{1,3}\)/gm)];
  //console.log(matches.length);
  const ops = matches.map(([match]) => match);
  //console.log(ops);

  let res = 0;

  for (const op of ops) {

    const tuple = op.match(/\(([0-9]{1,3}),([0-9]{1,3})\)/);
    res += parseInt(tuple[1], 10) * parseInt(tuple[2], 10);
  }
  console.log(res);
}

//file = readFileSync("test2.txt", {encoding: "utf-8"});
{
  //console.log(file);
  const matches = [...file.matchAll(/mul\([0-9]{1,3},[0-9]{1,3}\)|don\'t\(\)|do\(\)/gm)];
  //console.log(matches.length);
  const ops = matches.map(([match]) => match);
  //console.log(ops);

  let res = 0;
  let doitnow=true;

  for (const op of ops) {

    if (op === "do()") {
      doitnow = true;
    } else if (op === "don't()") {
      doitnow = false;
    } else {
      if (doitnow) {
        const tuple = op.match(/\(([0-9]{1,3}),([0-9]{1,3})\)/);
        res += parseInt(tuple[1], 10) * parseInt(tuple[2], 10);
      }
    }
  }

  console.log(res);
}

const lines = file.trim().split("\n")
for (const line of lines) {
}


