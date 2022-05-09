class Zone {
  constructor({x, y, width, height}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  getRel({x, y, width, height}) {
    return new Zone({
      x: Math.floor(this.width * x),
      y: Math.floor(this.height * y),
      width: Math.floor(this.width * width),
      height: Math.floor(this.height * height)
    });
  }

  static from(scr) {
    return new Zone(scr);
  }
}

module.exports = Zone;
