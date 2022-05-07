
const Vec = require('./vec.js');

let gameWindow;

module.exports = class Rgb {
  constructor(rgb, zone) {
    this.rgb = rgb;
    this.zone = zone;
  }

  colorAt({x, y}) {
    if(x >= this.zone.x &&
       y >= this.zone.y &&
       x <  this.zone.x + this.zone.width &&
       y <  this.zone.y + this.zone.height) {
         return this.rgb[y][x];
       } else {
         return [0, 0, 0];
       }
  }

  findColor (color, task) {
    for(let y = this.zone.y; y < this.zone.y + this.zone.height; y++) {
      for(let x = this.zone.x; x < this.zone.x + this.zone.width; x++) {
        let point = new Vec(x, y);
        if(color(this.colorAt(point))) {
            if(!task || task(point, this)) {
              return point;
          }
        }
      }
    }
  }

  static from(zone) {
    if(!gameWindow) throw new Error(`Set the workwindow first.`);

    const data = Array.from(gameWindow.capture(zone).data.values());
    let rgb = [];
    for (let y = 0, i = 0; y < zone.height; y++) {
      let row = [];
      for (let x = 0; x < zone.width; x++, i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        row[zone.x + x] = [r, g, b];
      }
      rgb[zone.y + y] = row;
    }

    return new Rgb(rgb, zone);
  }

  static setWorkwindowTo(workwindow) {
    gameWindow = workwindow;
  }
}
