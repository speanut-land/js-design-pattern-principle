class GeoCoder {
  getlatlng(address) {
    if (address === 'Amsterdam') {
      return '52.3700° N, 4.8900° E';
    } else if (address === 'London') {
      return '51.5171° N, 0.1062° W';
    } else if (address === 'Paris') {
      return '48.8742° N, 2.3470° E';
    } else if (address === 'Berlin') {
      return '52.5233° N, 13.4127° E';
    } else {
      return '';
    }
  }
}

class MyProxy {
  private geocoder = new GeoCoder();
  private geocache = {};

  getLatLng(address) {
    if (!this.geocache[address]) {
      this.geocache[address] = this.geocoder.getlatlng(address);
    }
    return this.geocache[address];
  }
  getCount() {
    return Object.keys(this.geocache).length;
  }
}
