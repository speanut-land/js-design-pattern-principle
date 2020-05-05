import { MyPromise } from './index';

function test(res, rej) {
  console.log('executor');
  setTimeout(() => {
    console.log('Timer');
    res(1);
  }, 1000);
}
console.log('start');
let promise1 = new MyPromise(test);
let promise2 = promise1.then(res => {
  console.log(res);
  return 2;
});
let promise3 = promise1.then(res => {
  console.log(promise2);
});
console.log('end');
