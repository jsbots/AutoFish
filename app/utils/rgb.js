const Vec = require("./vec.js");

const isInLimits = ({ x, y }, { width, height }) => {
  return x >= 0 && y >= 0 && x < width && y < height;
};

const createRgb = ({ data, width, height }) => {
  let pixelData = Array.from(data.values());
  let bitmap = [];
  for (let y = 0, i = 0; y < height; y++) {
    let row = [];
    for (let x = 0; x < width; x++, i += 4) {
      row[x] = pixelData.slice(i, i + 3);
    }
    bitmap[y] = row;
  }

  return {
    bitmap,
    colorAt(pos) {
      if (isInLimits(pos, { width, height })) {
        return bitmap[pos.y][pos.x];
      } else {
        return false;
      }
    },

    findColors(isColor, stopAtFirst) {
      let colors = [];
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let pos = new Vec(x, y);
          let color = bitmap[y][x];
          if(isColor(color)) {
            if(stopAtFirst) {
              return pos;
            } else {
              colors.push(pos);
            }
          }
        }
      }
      return colors.length ? colors : null;
    },
  };
};

module.exports = createRgb;
