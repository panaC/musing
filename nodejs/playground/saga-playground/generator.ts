
namespace test {

    function* identity(n: number): Generator<number, number, number> {
        return yield n;
    }

    function* counter(n: number): Generator<number, number, number> {
        while (true) {
            if (n) {
                const c = yield* identity(n);
                console.log("COUNTER: ", c);
                n = c;
            } else {
                yield -1;
                return;
            }
        }
    }

    console.time("yield*");

    const count = counter(3);
    const a1 = count.next();
    console.log(a1);

    const a2 = count.next((a1.value || 0) - 1);
    console.log(a2);

    const a3 = count.next((a2.value || 0) - 1);
    console.log(a3);

    const a4 = count.next((a3.value || 0) - 1);
    console.log(a4);

    const a5 = count.next((a4.value || 0) - 1);
    console.log(a5);

    const a6 = count.next((a5.value || 0) - 1);
    console.log(a6);

    console.timeEnd("yield*")

}


/*

{ value: 3, done: false }
COUNTER:  2
{ value: 2, done: false }
COUNTER:  1
{ value: 1, done: false }
COUNTER:  0
{ value: -1, done: false }
{ value: undefined, done: true }
{ value: undefined, done: true }

*/

namespace good {

    function* counter(n: number) {
        while (true) {
            if (n) {
                const c = yield n;
                console.log("COUNTER: ", c);
                n = c;
            } else {
                yield -1;
                return;
            }
        }
    }

    console.time("yield");

    const count = counter(3);
    const a1 = count.next();
    console.log(a1);

    const a2 = count.next((a1.value || 0) - 1);
    console.log(a2);

    const a3 = count.next((a2.value || 0) - 1);
    console.log(a3);

    const a4 = count.next((a3.value || 0) - 1);
    console.log(a4);

    const a5 = count.next((a4.value || 0) - 1);
    console.log(a5);

    const a6 = count.next((a5.value || 0) - 1);
    console.log(a6);

    console.timeEnd("yield")

}

