const Jimp = require('jimp');
const { createWorker } = require('tesseract.js');
const worker = createWorker();

(async () => {
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
})();

const readTextFrom = async ({data, width, height}, scale) => {
  let img;
  await new Promise((resolve) => {
    new Jimp({ data, width, height }, async (err, image) => {
      if(err) throw new Error(`Can't create an image for Jimp`);
      img = await image.greyscale().contrast(0.3).invert().scale(scale).getBase64Async(Jimp.MIME_PNG);
      resolve();
    });
  });
  let result = await worker.recognize(img);
  let words = result.data.words.map(({text, baseline}) => ({text, y: baseline.y0 / scale}));
  return words;
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


const sortWordsByItem = (words, itemHeight) => {
  let selected = [];
  words.forEach(word => {
    if(word.text.length < 4) return;
    let pos = selected[Math.floor(word.y / itemHeight)];
    if(!pos) {
      selected[Math.floor(word.y / itemHeight)] = word.text;
    } else {
      selected[Math.floor(word.y / itemHeight)] += ` ${word.text}`;
    }
  });

  return selected;
}


module.exports = {
  percentComparison,
  readTextFrom,
  sortWordsByItem
 };
