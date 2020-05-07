class Mortgage {
  name: string;
  constructor(name) {
    this.name = name;
  }
  applyFor(amount) {
    let result = 'approved';
    if (!new Bank().verify(this.name, amount)) {
      result = 'denied';
    } else if (!new Credit().get(this.name)) {
      result = 'denied';
    } else if (!new Background().check(this.name)) {
      result = 'denied';
    }
    return this.name + ' has been ' + result + ' for a ' + amount + ' mortgage';
  }
}

class Bank {
  verify(name, amount) {
    // complex logical
    return true;
  }
}

class Credit {
  get(name) {
    //complex logic
    return true;
  }
}

class Background {
  //complex logic
  check(name) {
    return true;
  }
}

let mortgage = new Mortgage('Joan Templeton');
let result = mortgage.applyFor('$100,000');

console.log(result);
