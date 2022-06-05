const Rgb = require("../utils/rgb.js");

class RgbAdapter {
  constructor(workwindow, zone) {
    this.workwindow = workwindow;
    this.zone = zone;
    this.colors = {};
  }

  getRgb(zone) {
    if(zone) {
      zone.x = zone.x < 0 ? 0 : zone.x;
      zone.y = zone.y < 0 ? 0 : zone.y;
      zone.height = zone.height > this.zone.height ? this.zone.height : zone.height;
      zone.width = zone.width > this.zone.width ? this.zone.width : zone.width;
    }

    const capturedData = Array.from(
      this.workwindow.capture(zone || this.zone).data.values()
    );
    return Rgb.from(capturedData, zone || this.zone);
  }

  findColor(color, task, exception) {
    let rgb = this.getRgb();
    if(exception) {
      rgb = rgb.cutOut(exception);
    }
    return rgb.findColor(color, task);
  }

  colorAt(pos) {
    return this.getRgb({ ...pos, width: 1, height: 1 }).colorAt(pos);
  }

  registerColors(colors) {
    this.colors = colors;
  };

  static from(workwindow, zone) {
    return new RgbAdapter(workwindow, zone);
  }
}

module.exports = RgbAdapter;
