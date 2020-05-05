import { MyPromise } from './index';

const promise1 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 500, 'one');
});

const promise2 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 1000, 'two');
});

MyPromise.race([promise1, promise2]).then(value => {
  console.log(value);
  // Both resolve, but promise2 is faster
});
// expected output: "two"
