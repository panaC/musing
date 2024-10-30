
// https://github.com/reduxjs/redux/blob/6dea12676d26ee1e0623330222d814bbbf098724/src/applyMiddleware.ts#L58
// https://github.com/reduxjs/redux/blob/9d3273846aa8906d38890c410b62fb09a4992018/src/createStore.ts#L91


import * as saga from "redux-saga";
import { applyMiddleware, createStore } from "redux";
import * as effects from "redux-saga/effects";

console.log(saga);
// {
//     CANCEL: [Getter],
//     SAGA_LOCATION: [Getter],
//     buffers: [Getter],
//     detach: [Getter],
//     END: [Getter],
//     channel: [Getter],
//     eventChannel: [Getter],
//     isEnd: [Getter],
//     multicastChannel: [Getter],
//     runSaga: [Getter],
//     stdChannel: [Getter],
//     default: [Function: sagaMiddlewareFactory]
//   }

{
  // const sagaMiddleware = saga.default();

  // const reducer = (state = {}, action) => action;

  // const factoryStoreMiddleware = applyMiddleware(sagaMiddleware);
  // const createStoreMiddleware = factoryStoreMiddleware(createStore);
  // const store = createStoreMiddleware(reducer);

  // function* fnA() {
  //   const result = []
  //   result.push((yield effects.take('ACTION-1')).val)
  //   result.push((yield effects.take('ACTION-2')).val)
  //   return result
  // }

  // let actual = [];
  
  // function* root() {
  //   actual.push(yield effects.call(fnA))
  // }

  // Promise.resolve()
  //   .then(() => store.dispatch({ type: 'ACTION-1', val: 1 }))
  //   .then(() => store.dispatch({ type: 'ACTION-2', val: 2 }))

  // sagaMiddleware.run(root).toPromise().then(() => console.log(actual));
  // // actual = [ [ 1, 2 ] ]

}



{
  const sagaMiddleware = saga.default();

  const reducer = (state = {}, action) => action;

  const factoryStoreMiddleware = applyMiddleware(sagaMiddleware);
  const createStoreMiddleware = factoryStoreMiddleware(createStore);
  const store = createStoreMiddleware(reducer);
  
  const result = []
  function* fnA() {

    while (true) {
      result.push((yield effects.take('ACTION-1')).val)
      result.push((yield effects.take('ACTION-2')).val)

      console.log(result);
    }
  
    
    return result
  }

  let actual = [];
  function* actualSaga() {
    actual.push(yield effects.spawn(fnA))
    // console.log(actual);
    // actual = [ [ 1, 2 ] ]

  }

  function* root() {
    yield effects.spawn(actualSaga);
  }

  setTimeout(() => {
    store.dispatch({ type: 'ACTION-1', val: 1 })
    store.dispatch({ type: 'ACTION-2', val: 2 })
  }, 400);

  sagaMiddleware.run(root).toPromise().then(() => console.log("end"));
  // actual = []
}

// {
//   const sagaMiddleware = saga.default();

//   const reducer = (state = {}, action) => action;

//   const factoryStoreMiddleware = applyMiddleware(sagaMiddleware);
//   const createStoreMiddleware = factoryStoreMiddleware(createStore);
//   const store = createStoreMiddleware(reducer);

//   function* fnA() {
//     const result = []
//     result.push((yield effects.take('ACTION-1')).val)
//     result.push((yield effects.take('ACTION-2')).val)
//     return result
//   }

//   function* saga1() {
//     yield effects.delay(1000);
//     console.log("saga1 delay end");
//   }

//   function* saga2() {
//     yield effects.delay(2000);
//     console.log("saga2 delay end");
//     yield effects.call(() => Promise.reject("bad reason"));
//     console.log("reject saga2");
//   }

//   function* root() {

//     const sagas = [
//       saga1,
//       saga2,
//     ];
  
//     yield effects.all(sagas.map(saga =>
//       effects.spawn(function* () {
//         while (true) {
//           try {
//             yield effects.call(saga)
//             break
//           } catch (e) {
//             console.log(e)
//           }
//         }
//       }))
//     );
//   }

//   Promise.resolve()
//     .then(() => store.dispatch({ type: 'ACTION-1', val: 1 }))
//     .then(() => store.dispatch({ type: 'ACTION-2', val: 2 }))

//   sagaMiddleware.run(root).toPromise().then(() => console.log("runSaga end"));

//   // runSaga end
//   // saga1 delay end
//   // saga2 delay end
//   // bad reason
//   // saga2 delay end
//   // bad reason
//   // saga2 delay end
//   // bad reason
//   // ...
// }