const Rgb = require("../utils/rgb.js");

class RgbAdapter {
  constructor(workwindow, zone) {
    this.workwindow = workwindow;
    this.zone = zone;
  }

  getRgb(point) {
    const capturedData = Array.from(
      this.workwindow.capture(point || this.zone).data.values()
    );
    return Rgb.from(capturedData, point || this.zone);
  }

  findColor(color, task) {
    return this.getRgb().findColor(color, task);
  }

  colorAt(pos) {
    return this.getRgb({ ...pos, width: 1, height: 1 }).colorAt(pos);
  }

  static from(workwindow, zone) {
    return new RgbAdapter(workwindow, zone);
  }
}

module.exports = RgbAdapter;
