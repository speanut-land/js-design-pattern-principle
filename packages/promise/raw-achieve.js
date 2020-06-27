let promise1 = new Promise(function (resolve) {
  resolve(1);
});
let promise2 = new Promise(function (resolve) {
  resolve(2);
});
let promise3 = new Promise(function (resolve, rej) {
  setTimeout(() => {
    rej("hahahahah");
  }, 2000);
});
Promise.newAll = function (promises) {
  let result = [];
  let count = 0;
  let len = promises.length;
  return new Promise((res, rej) => {
    for (let i = 0; i < len; i++) {
      Promise.resolve(promises[i]).then(
        (val) => {
          count++;
          result[i] = val;
          if (count === len) {
            return res(result);
          }
        },
        (err) => {
          console.log(err);
          return rej(err);
        }
      );
    }
  });
};

let promiseAll = Promise.newAll([promise1, promise2, promise3]);
promiseAll.then(
  (res) => {
    console.log(res);
  },
  (err) => {
    console.log(err);
  }
);
