import { Observer } from './observer';

export class Subject {
  observers: Observer[] = [];
  constructor() {}

  subscribe(obs: Observer) {
    this.observers.push(obs);
  }

  unsubscibe(obs: Observer) {
    this.observers = this.observers.filter(item => item !== obs);
  }

  notify(data?) {
    let num = 0;
    this.observers.length &&
      this.observers.forEach(item => {
        item.update(`this is the ${num++} observer`);
      });
  }
}
