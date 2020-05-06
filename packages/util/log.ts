class Log {
  log: string = '';
  constructor() {}

  add(msg: string) {
    this.log += msg + '/n';
  }

  show() {
    console.log(this.log);
  }
}
