const Jimp = require(`jimp`);
const path = require("path");

const once = (fn) => {
  let result;
  return (...args) => {
    if (!result) {
      return (result = fn(...args));
    } else {
      return result instanceof Promise ? Promise.resolve(result) : result;
    }
  };
};

const getBitmap = async (bobberImgPath, reader = Jimp) => {
  const { bitmap } = await reader.read(path.join(__dirname, bobberImgPath));
  return bitmap;
};

const getBitmapOnce = once(getBitmap);

const constructBitmap = ({ data, width, height }) => {
  let pixels = [];
  for (let y = 0, i = 0; y < height; y++) {
    for (let x = 0; x < width; x++, i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      pixels.push({
        pos: { x, y },
        color: [r, g, b],
      });
    }
  }
  return pixels;
};

const getBitmapAsync = (event, path) => {
  return getBitmapOnce(path).then(constructBitmap);
};

module.exports = getBitmapAsync;
