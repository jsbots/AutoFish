module.exports = class Vec {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  plus(vec) {
    return new Vec(this.x + vec.x, this.y + vec.y);
  }

  get dist() {
    return Math.sqrt(
      Math.pow(Math.abs(this.x), 2) + Math.pow(Math.abs(this.y), 2)
    );
  }

  getPointsAround(size = 1) {
    let pointsAround = [];
    for (let y = this.y - size; y <= this.y + size; y++) {
      for (let x = this.x - size; x <= this.x + size; x++) {
        let point = new Vec(x, y);
        if (point.x == this.x && point.y == this.y) {
          continue;
        } else {
          pointsAround.push(point);
        }
      }
    }

    return pointsAround;
  }
};
