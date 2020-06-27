class Observable<T> {
  source: Observable<any> | undefined;
  operator: undefined;
  constructor(subscribe) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }
  _subscribe(subscriber) {
    const { source } = this;
    return source && source.subscribe(subscriber);
  }
  subscribe({ observerOrNext, complete }) {
    observerOrNext(1);
    complete();
  }
}
let cc = new Observable((subscriber) => {
  subscriber.next(1);
  subscriber.complete();
});
