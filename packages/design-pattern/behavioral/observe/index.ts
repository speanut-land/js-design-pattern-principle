import { Subject } from './subject';
import { Observer } from './observer';

let subject = new Subject();

for (let i = 0; i < 10; i++) {
  subject.subscribe(new Observer());
}

subject.notify();
