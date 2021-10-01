function sleep(time, callback) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
    callback();
}

const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('an event occurred!');
});

console.time("test")
console.time("test1")

setTimeout(() => console.log("timeout"), 200);
setTimeout(() => myEmitter.emit('event') && console.timeEnd("test1"), 200);
setTimeout(() => myEmitter.emit('event'), 0);
setTimeout(() => myEmitter.emit('event'), 0);


console.log("Hello :?");
console.log("Hello :?");

sleep(100, () => console.log("sleep 1"))

console.log("Hello :3");
console.log("Hello :3");

sleep(100, () => console.log("sleep 2"))

console.log("Hello :?");
console.log("Hello :?");

sleep(100, () => console.log("sleep 1"))

console.log("Hello :3");
console.log("Hello :3");

sleep(100, () => console.log("sleep 2"))



console.timeEnd("test")
