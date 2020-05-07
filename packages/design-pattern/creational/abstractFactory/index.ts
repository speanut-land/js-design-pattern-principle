enum Car {
  HONDA,
  MAZDA,
}

abstract class CarPart {
  static getFactory(key: Car) {
    const hondaFactory = new HondaFactory();
    const mazdaFactory = new MazdaFactory();

    switch (key) {
      case Car.HONDA:
        return hondaFactory;

      case Car.MAZDA:
        return mazdaFactory;

      default:
        return mazdaFactory;
    }
  }

  abstract getLeftDoor();
  abstract getRightDoor();
}

//Concrete Honda Factory derived from abstract CarPart
class HondaFactory extends CarPart {
  getLeftDoor() {
    return new HondaLeftDoor();
  }

  getRightDoor() {
    return new HondaRightDoor();
  }
}

//Concrete Mazda Factory derived from abstract CarPart
class MazdaFactory extends CarPart {
  getLeftDoor() {
    return new MazdaLeftDoor();
  }

  getRightDoor() {
    return new MazdaRightDoor();
  }
}

// Specifics products ( cell values of the table )

class HondaRightDoor {
  makePart() {
    return 'Im Honda Right Door ';
  }
}
class HondaLeftDoor {
  makePart() {
    return 'Im Honda Left Door';
  }
}
class MazdaRightDoor {
  makePart() {
    return 'Im Mazda Right Door ';
  }
}
class MazdaLeftDoor {
  makePart() {
    return 'Im Mazda Left Door';
  }
}

let factory = CarPart.getFactory(Car.HONDA);
let rightdoor = factory.getRightDoor();

console.log(rightdoor.makePart());

factory = CarPart.getFactory(Car.MAZDA);
rightdoor = factory.getRightDoor();
let leftdoor = factory.getLeftDoor();

console.log(rightdoor.makePart());
console.log(leftdoor.makePart());
