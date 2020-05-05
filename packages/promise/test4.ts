import { MyPromise } from './index';
const promise1 = MyPromise.resolve(3);
const promise2 = new Promise((resolve, reject) => setTimeout(reject, 100, 'foo'));
const promises = [promise1, promise2];
MyPromise.allSettled(promises).then(results => results.forEach(result => console.log(result)));

// expected output:
// "fulfilled"
// "rejected"
