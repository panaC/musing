

import * as saga from "redux-saga";
import * as effects from "redux-saga/effects";

import { EventEmitter } from "events";
import { inspect } from "util";

const emitter = new EventEmitter();
const channel = saga.stdChannel()
emitter.on("SAGA", channel.put)

saga.runSaga(
    {
        channel,
        dispatch: (out) => emitter.emit("SAGA", out),
        getState: () => undefined,
    },
    sagaRoot
)
    .toPromise()
    .then(() => console.log("runSaga end"))

    // why when 'spawn' : "runSaga end" is printed
    // and when 'fork' : "runSaga end" isn't printed
    // ?

    .catch((e) => console.error("runSaga: ", e));

function* sagaRoot() {

    yield effects.spawn(fn1);
    yield effects.spawn(fn2);
    yield effects.spawn(fn3);
    yield effects.spawn(fn4);
    yield effects.spawn(fn5);
}

function* fn1() {
    console.log("fn1 start");
    
    yield effects.put({ type: "ACTION" });

    console.log("fn1 end");
}

function* fn2() {
    console.log("fn2 start");

    yield effects.takeLeading("ACTION", function*() {

        try {
            yield effects.call(() => {
    
                if (Math.random() * 10 > 6) {
                    return Promise.reject("bad reason");
                }
        
                console.log("fn2 ACTION received");
                return Promise.resolve("ok");
    
            })    
        } catch (e) {
            console.error("fn2 ACTION rejected", e);
            
        }
    });

    console.log("fn2 end");
}

function* fn3() {
    console.log("fn3 start");

    while (true) {
        const take = yield effects.take("ACTION");

        console.log("fn3 ACTION received");
        // console.log(inspect(take));

    }

    console.log("fn3 end");

}

function* fn4() {
    console.log("fn4 start");

    yield effects.spawn(function*() {
        
        while (true) {
            yield effects.take("ACTION");
            try {
                yield effects.call(() => {
                    
                    if (Math.random() * 10 > 6) {
                        return Promise.reject("bad reason");
                    }
                    
                    console.log("fn4 ACTION received");
                    return Promise.resolve("ok");
        
                })    
            } catch (e) {
                console.error("fn4 ACTION rejected", e);
                
            }
        }    
    });

    console.log("fn4 end");
}

// tslint:disable-next-line: no-empty
const noop = () => { };

export function takeSpawnLeading<P extends effects.ActionPattern>(
    pattern: P,
    worker: () => any,
    cbErr: (e: any) => void = noop,
) {
    return effects.spawn(function*() {
        while (true) {
            yield effects.take(pattern);
            try {
                yield effects.call(worker);
            } catch (e) {
                cbErr(e);
            }
        }
    });
}

function* fn5() {
    console.log("fn5 start");
    
    const worker = () => {
        if (Math.random() * 10 > 6) {
            return Promise.reject("bad reason");
        }

        console.log("fn5 ACTION received");
        return Promise.resolve("ok");

    }
    const cbErr = (e) => console.error("fn5 ACTION rejected", e);

    yield takeSpawnLeading("ACTION", worker, cbErr);

    console.log("fn5 end");
}

setTimeout(() => emitter.emit("SAGA", { type: "ACTION" }), 1000);

/*

fn1 start
fn2 start
fn2 end
fn3 start
fn4 start
fn4 end
fn5 start
fn5 end
fn2 ACTION received
fn3 ACTION received
fn5 ACTION received
fn1 end
fn4 ACTION rejected bad reason
runSaga end
fn3 ACTION received
fn2 ACTION received
fn4 ACTION rejected bad reason
fn5 ACTION rejected bad reason

*/

/*

fn1 start
fn2 start
fn2 end
fn3 start
fn4 start
fn4 end
fn5 start
fn5 end
fn2 ACTION received
fn3 ACTION received
fn5 ACTION received
fn1 end
fn4 ACTION rejected bad reason
runSaga end
fn3 ACTION received
fn2 ACTION received
fn4 ACTION received
fn5 ACTION rejected bad reason

*/

/*
...
*/