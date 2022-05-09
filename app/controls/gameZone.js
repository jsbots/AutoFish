const Rgb = require('../utils/rgb.js');

class GameZone {
  constructor(workwindow, zone) {
    this.workwindow = workwindow;
    this.zone = zone;
  }

  _getRgb(point) {
    const capturedData = Array.from(this.workwindow.capture(point || this.zone).data.values());
    return Rgb.from(capturedData, point || this.zone);
  }

  findColor(color, task) {
    return this._getRgb().findColor(color, task);
  }

  colorAt(pos) {
    return this._getRgb({...pos, width: 1, height: 1}).colorAt(pos);
  }

  static from(workwindow, zone) {
    return new GameZone(workwindow, zone);
  }
}

module.exports = GameZone;
