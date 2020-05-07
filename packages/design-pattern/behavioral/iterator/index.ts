class IteratorPattern {
  items: any[];
  index: number = 0;
  constructor(items: any[]) {
    this.items = items;
  }

  first() {
    this.reset();
    return this.next();
  }

  next() {
    return this.items[this.index++];
  }

  hasNext() {
    return this.index <= this.items.length;
  }

  reset() {
    this.index = 0;
  }

  each(cb) {
    for (let item = this.first(); this.hasNext(); item = this.next()) {
      cb(item);
    }
  }
}
