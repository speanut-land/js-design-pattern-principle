# 70行实现Promise核心源码

> 前言：
>
> ​		一直以来都是只会调用Promise的API，而且调API还是调用axios封装好的Promise，丢人！！！没有真正的去了解过它的原理是如何实现的，自己也看过很多博主实现的Promise，但总觉得用原型链的OOP晦涩难懂。

个人的理解：如果带着观察者模式的想法来理解Promise源码，你就会发现Promise本身其实一种微任务的观察者模式，一个异步任务的完成，`res/rej`的状态回调hook => 通知所有`then()`订阅的promise对象。promise只是将观察者模式运用到微任务。让promise对象能够具有很高的优先级。说到底还是一种解藕的设计模式。

## promise是诞生的原因？

​	在了解Promise之前，我觉得有必要去了解一下Promise诞生的原因。 直接就那上面的axios来说吧，以前没有出现axios的时候，大家是怎么去与后台接口做交互的呢？ 我当时是用jQuery封装好的AJAX去做的。下面有一个例子

``` javascript
$.ajax({
    type: 'POST',                     //GET or POST
    url: "jquery-ajax",               
    cache: false,                     
    data: {todo:"ajaxexample1"},      
    success: functionSucceed,         
    error: functionFailed,            
    statusCode: {                     
      404: function() {
        alert("page not found");
      }
    }
});
```

如果是单独的一个请求还好，但是如果得发送两个相互依赖的请求呢？这时候就会出现**回调地狱**的问题，不能自拔。以下就是一个简单的例子。

```javascript
a(function (result1) {
  b(result1,function (result2) {
    c(result2, function (result3) {
      d(result3, function (result4) {
        e(result4, function (result5) {
          console.log(result5)
        })
      })
    })
  })
})
```

假如说让你去维护一个这样的代码... 害怕的兄弟萌把害怕打在评论区[doge]。上面的代码有什么问题呢？

+ 嵌套调用，下面的任务依赖上个任务的请求结果。如果2层还是容易理顺逻辑，但是一旦出现层数过多，**可读性就会变得非常差，就像一坨屎**
+ **任务的不确定性**。每一个任务会有成功和失败两种状态，就拿上面的代码，假如说有5层的嵌套，就要做5次的成功、失败的判断函数，明显的增加了代码的复杂度，不符合Unix哲学。

## 用Typescript实现MyPromise

问题出来了，那解决的思路也有了:

+ 消灭嵌套
+ 合并多个错误

设计一个对象实现上面两个功能，使用TypeScript的OOP相比于用原型链来实现会更加的容易理解。在实现Promise源码之前，对于Promise的用法、基本定义一定要有一个全方面的认知，不然去了解Promise也艰深晦涩。可以先去看看[MDN对于Promise的本质定义](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)

### 定义基本的属性和构造函数

Promise有三种状态：pending、 resolve、reject 对应了 等待、成功、失败，表示一个异步任务的状态是怎么样的。

```typescript
enum States {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED'
}

class MyPromise {
  private state: States = States.PENDING;
  private handlers: any[] = [];
  private value: any;
  constructor(executor: (resolve, reject) => void) {
    try {
      executor(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }
}
```

handlers数组是表示当调用了then()方法时，向handlers添加回调函数。比如以下的情况，handlers中就会有两个回调函数，等待Promise的resolve/reject设置状态之后,调用handlers里的所有回调函数。

```typescript
let promise1 = new MyPromise(test);
let promise2 = promise1
  .then(res => {  // <=== 匿名回调函数
    console.log(res);
    return 2;
  });
let promise3 = promise1
  .then(res => { // <=== 匿名回调函数
    setTimeout(() => {
      console.log(res + '***********************');
      return 4;
    }, 1000);
  })
```

value表示的一个异步函数返回值。

executor是带有 `resolve` 和 `reject` 两个参数的函数 。Promise构造函数执行时立即调用`executor` 函数， `resolve` 和 `reject` 两个函数作为参数传递给`executor`**（executor 函数在Promise构造函数返回所建promise实例对象前被调用）**

回到主题，我觉得先介绍then()方法是如何实现的比较合适

### 实现then()

```typescript
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
```

then方法的工作原理：返回一个新的Promise对象，且向原Promise对象中的handlers添加一个包含回调函数的对象，**如果Promise处于Settled状态，那就直接执行回调函数**，否则，得等待Promise的状态设置。

```typescript
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
```

### 实现resolve和reject回调函数

按照原生的Promise.then()方法的逻辑来讲，原Promise的状态会直接影响到`then`方法返回的Promise的状态，因此设置状态的`resolve`和`reject`函数逻辑如下：

```typescript
private resolve = value => this.setResult(value, States.RESOLVED);

private reject = value => this.setResult(value, States.REJECTED);

private setResult = (value, state: States) => {
    const set = () => {
      if (this.state !== States.PENDING) return;
      this.value = value;
      this.state = state;
      return this.execHandlers();
    };
    setTimeout(set, 0);
};
```

因为无法实现真正的Promise的微任务，因此只能够通过setTimeout(fn,0)，勉强来模拟实现

```typescript
private resolve = value => this.setResult(value, States.RESOLVED);

private reject = value => this.setResult(value, States.REJECTED);

private setResult = (value, state: States) => {
    const set = () => {
      if (this.state !== States.PENDING) return;
      this.value = value;
      this.state = state;
      return this.execHandlers();
    };
    setTimeout(set, 0);
  };
```

离真正的微任务在一些特别的代码上还是有很大差距的，因为setTimeout是宏任务，在`execHandlers`方法中通过foreach 执行本次Promise的handlers中的回调函数时，处于同一个事件循环，以下的代码就会和真正的Promise有出入。

```typescript
function test(res, rej) {
  console.log('executor');
  setTimeout(() => {
    console.log('Timer');
    res(1);
  }, 1000);
}
console.log('start');
let promise1 = new MyPromise(test); // <== 这里替换成原生的Promise，会发现promise2状态不同
let promise2 = promise1.then(res => {
  console.log(res);
  return 2;
});
let promise3 = promise1.then(res => {
  console.log(promise2); //原生的状态是resolve，MyPromise的状态是pending
});
console.log('end');
```

## 总结

就拿上面的demo来理解整个Promise帮助我们做了什么吧！

+ 控制台输出'start ' 
+ 创建MyPromise对象并且执行test函数，引用赋值于promise1=> 输出'executor'，向延迟队列添加等待1s的回调函数
+ 调用promise1`then`方法 => 创建一个新的promise实例赋于给promise2，并且新的promise实例的`executor`执行promise1的`attachHandler`，将then函数中的回调函数对象push进promise1的`handlers`属性中，如果promise1已经是settled状态，直接更加promise1的状态来执行不同函数
+ promise3同promise2一样的道理，这时promise1的`handlers`数组中有两个持有回调函数的对象，这两个Promise3和promise2都等着promise1的`setResult`来执行相应的回调，因此promise3和promise此时属于pending状态
+ 控制台输出'end'
+ 等待1秒，控制台输出'Timer' ，调用Promise1的resolve函数，向微任务队列添加setResult状态函数，MyPromise使用settimeout模拟微任务队列
+ setResult状态函数根据`res/rej`状态执行handlers中的所有then添加的回调，

Promise类的`catch`和`finally`都是在then上建立的语法糖，具体大家可以更具MDN的定义来实现，还有Promise类的静态方法，可以参考我自己GitHub的实现。

**不断的沉淀下来，总归会理解一个东西存在的意义。理解了promise的原理之后，去理解其他的底层实现有会一个很好的基础，了解了Promise底层之后，深深的感受到设计模式的强大。**

**如果小伙伴们觉得不错的话，点赞支持一下嗷 铁汁～**

以下是用Typescript实现的MyPromise源代码，不过参数并没有用类型，所以称作es6的class语法也不为过。

```typescript
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
}
```

参考链接

https://www.freecodecamp.org/news/how-to-implement-promises-in-javascript-1ce2680a7f51/

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise