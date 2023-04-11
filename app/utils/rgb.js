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
      let r = pixelData[i];
      let g = pixelData[i + 1];
      let b = pixelData[i + 2];
      row[x] = [r, g, b];
    }
    bitmap[y] = row;
  }

  return {
    colorAt(pos) {
      if (isInLimits(pos, { width, height })) {
        return bitmap[pos.y][pos.x];
      } else {
        return [0, 0, 0];
      }
    },

    saturate(rs, gs, bs) {
      bitmap = bitmap.map(y => y.map(([r, g, b]) => [r + rs, g + gs, b + bs]));
    },

    cutOut(exception) {
      exception.forEach(({ x, y }) => {
        if(isInLimits({ x, y }, { width, height })) {
          bitmap[y][x] = [0, 0, 0];
        }
      })
    },

    findColors({ isColor, atFirstMet, task, limit, reverseDir }) {
      let colors = [];
      if(!reverseDir) {
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let pos = new Vec(x, y);
            let color = bitmap[y][x];
            if(isColor(color)) {

              if(limit != null) {
                limit--
                if(limit < 0) {
                  return null;
                }
              };

              if(!task || task(pos, color, this)) {
                if(atFirstMet) {
                  return pos;
                } else {
                  colors.push(pos);
                }
              }
            }
          }
        }
      } else {
        for (let y = height - 1; y > -1; y--) {
          for (let x = 0; x < width; x++) {
            let pos = new Vec(x, y);
            let color = bitmap[y][x];
            if(isColor(color)) {

              if(limit != null) {
                limit--
                if(limit < 0) {
                  return null;
                }
              };

              if(!task || task(pos, color, this)) {
                if(atFirstMet) {
                  return pos;
                } else {
                  colors.push(pos);
                }
              }
            }
          }
        }
      }
      return colors.length ? colors : null;
    },
  };
};

module.exports = createRgb;
