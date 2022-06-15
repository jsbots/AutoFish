const Jimp = require('jimp');
const { createWorker } = require('tesseract.js');
const worker = createWorker();

(async () => {
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
})();

const readTextFrom = async ({data, width, height}) => {
  let img;
  await new Promise((resolve) => {
    new Jimp({ data, width, height }, async (err, image) => {
      if(err) throw new Error(`Can't create an image for Jimp`);
      img = await image.greyscale().invert().getBase64Async(Jimp.MIME_PNG);
      resolve();
    });
  });
  let { data: { text } } = await worker.recognize(img);
  return text;
}

const percentComparison = (first, second) => {
  let rightLettersNum = 0;
  if(first.length == second.length) {
    [...first].forEach((letter, position) => {
      if(letter == second[position]) {
        rightLettersNum++;
      }
    });
  }
  return rightLettersNum / first.length * 100;
};

module.exports = {
  percentComparison,
  readTextFrom
 };
