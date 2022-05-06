const Vec = require('./vec.js');

module.exports = class Rgb {
  constructor(rgb, zone) {
    this.rgb = rgb;
    this.zone = zone;
  }

  colorAt({x, y}) {
    return this.rgb[y][x];
  }

  findColor (color, task) {
    for(let y = 0; y < this.rgb.length; y++) {
      for(let x = 0; x < this.rgb[0].length; x++) {
        let point = new Vec(x, y);
        if(color(this.colorAt(point))) {
            if(!task || task(point, this)) {
              return point.plus(this.zone);
          }
        }
      }
    }
  }

  static from(game, zone) {
    const data = Array.from(game.workwindow.capture(zone).data.values());
    let rgb = [];
    for (let y = 0, i = 0; y < zone.height; y++) {
      let row = [];
      for (let x = 0; x < zone.width; x++, i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        row.push([r, g, b]);
      }
      rgb.push(row);
    }

    return new Rgb(rgb, zone);
  }
}
