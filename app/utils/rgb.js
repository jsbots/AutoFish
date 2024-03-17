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
    getBitmap() {
      return {data: Buffer.from(bitmap.flatMap((v) => v).flatMap(v => v)), width, height};
    },

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

    findColors({ isColor, atFirstMet, task, limit, direction, saveColor }) {
      let colors = [];

      if(!direction) direction = `normal`;

      switch (direction) {
        case `normal`: {
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              let pos = new Vec(x, y);
              let color = bitmap[y][x];
              if (isColor(color)) {
                if (limit != null) {
                  limit--;
                  if (limit < 0) {
                    return null;
                  }
                }

                if (!task || task(pos, color, this)) {
                  if (atFirstMet) {
                    return pos;
                  } else {
                    if(saveColor) {
                      colors.push({pos, color})
                    } else {
                      colors.push(pos);
                    }
                  }
                }
              }
            }
          }
          break;
        }
        case `reverse`: {
          for (let y = height - 1; y > -1; y--) {
            for (let x = 0; x < width; x++) {
              let pos = new Vec(x, y);
              let color = bitmap[y][x];
              if (isColor(color)) {
                if (limit != null) {
                  limit--;
                  if (limit < 0) {
                    return null;
                  }
                }

                if (!task || task(pos, color, this)) {
                  if (atFirstMet) {
                    return pos;
                  } else {
                    if(saveColor) {
                      colors.push({pos, color})
                    } else {
                      colors.push(pos);
                    }
                  }
                }
              }
            }
          }
          break;
        }
        case `center`: {
          let center = {x: Math.floor(width / 2), y: Math.floor(height / 2)};
          let stepDiffX = 1;
          let stepDiffY = 1;

          if(height > width) stepDiffX = width / height;
          if(width > height) stepDiffY = height / width;
          for (let step = 1; step < Math.floor(Math.max(height, width) / 2); step++) {
            for(let angle = 0; angle < Math.PI * 2; angle += ((Math.PI * 2 / 8) / step)) {
              let x = center.x + Math.round(Math.cos(angle) * (step * stepDiffX));
              let y = center.y + Math.round(Math.sin(angle) * (step * stepDiffY));

              let pos = new Vec(x, y);
              if(!bitmap[y] || !bitmap[y][x]) {
                continue;
              }
              let color = bitmap[y][x];
              if (isColor(color)) {
                if (limit != null) {
                  limit--;
                  if (limit < 0) {
                    return null;
                  }
                }

                if (!task || task(pos, color, this)) {
                  if (atFirstMet) {
                    return pos;
                  } else {
                    if(saveColor) {
                      colors.push({pos, color})
                    } else {
                      colors.push(pos);
                    }
                  }
                }
              }
            }
          }

          break;
        }
      }


      return colors.length ? colors : null;
    },
  };
};

module.exports = createRgb;
