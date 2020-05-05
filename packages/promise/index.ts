import { isThenable } from './util';
enum States {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED'
}
export class MyPromise {
  private state: States = States.PENDING;
  private handlers: any[] = [];
  private value: any;
  constructor(callback: (resolve, reject) => void) {
    try {
      callback(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }

  private resolve = value => this.setResult(value, States.RESOLVED);
  private reject = value => this.setResult(value, States.REJECTED);

  private setResult = (value, state: States) => {
    const set = () => {
      if (this.state !== States.PENDING) return;
      // the step is prepare for Promise.all,used to judge whether it is a constant or Promise object
      if (isThenable(value)) {
        return value.then(this.resolve, this.reject);
      }
      this.value = value;
      this.state = state;
      return this.execHandlers();
    };
    setTimeout(set, 0);
  };

  private execHandlers = () => {
    if (this.state === States.PENDING) return;
    this.handlers.forEach(handler => {
      if (this.state === States.REJECTED) {
        return handler.onFail(this.value);
      }
      return handler.onSuccess(this.value);
    });

    this.handlers = [];
  };

  private attachHandler = (handler: any) => {
    this.handlers.push(handler);
    this.execHandlers();
  };

  then(onSuccess?, onFail?) {
    return new MyPromise((resolve, reject) => {
      return this.attachHandler({
        onSuccess: result => {
          if (!onSuccess) return resolve(result);
          try {
            return resolve(onSuccess(result));
          } catch (e) {
            return reject(e);
          }
        },
        onFail: reason => {
          if (!onFail) return reject(reason);
          try {
            return resolve(onFail(reason));
          } catch (e) {
            return reject(e);
          }
        }
      });
    });
  }

  catch(onFail) {
    return this.then(val => val, onFail);
  }

  /**
   * finally(cb) is similar to then(cb,cb)
   * but Unlike Promise.resolve(2).then(() => {}, () => {}) (which will be resolved with undefined),
   * Promise.resolve(2).finally(() => {}) will be resolved with 2.
   * so save previous Promise value
   */
  finally(cb) {
    return new MyPromise((resolve, reject) => {
      let val;
      let isRejected;
      return this.then(
        value => {
          isRejected = false;
          val = value;
          return cb();
        },
        reason => {
          isRejected = true;
          val = reason;
          return cb();
        }
      ).then(() => {
        if (isRejected) {
          return reject(val);
        }
        return resolve(val);
      });
    });
  }

  //Static method
  static resolve(value) {
    return new MyPromise(resolve => {
      return resolve(value);
    });
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => {
      return reject(reason);
    });
  }

  static all(promises: any[]) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        return reject(new TypeError('Please provide an array.'));
      }
      let count = promises.length;
      const resolvedPromises = [];

      const tryResolve = (value, index) => {
        count -= 1;
        resolvedPromises[index] = value;
        if (count !== 0) return;
        resolve(resolvedPromises);
      };
      promises.forEach((item, index) => {
        MyPromise.resolve(item)
          .then(value => tryResolve(value, index))
          .catch(reason => reject(reason));
      });
    });
  }

  static race(promises: any[]) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(item => {
        MyPromise.resolve(item)
          .then(value => resolve(value))
          .catch(reason => reject(reason));
      });
    });
  }

  //allSettled is simple to all method ,just add state to result
  static allSettled(promises: any[]) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        return reject(new TypeError('Please provide an array.'));
      }
      let count = promises.length;
      const resultState = [];

      const tryResolve = (value, index) => {
        count -= 1;
        resultState[index] = value;
        if (count !== 0) return;
        resolve(resultState);
      };
      promises.forEach((item, index) => {
        MyPromise.resolve(item)
          .then(_ => tryResolve('fulfilled', index))
          .catch(_ => tryResolve('rejected', index));
      });
    });
  }

  static delay(time) {
    return new MyPromise(resolve => {
      return setTimeout(resolve, time);
    });
  }
}
