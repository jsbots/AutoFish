const Jimp = require("jimp");
const { createWorker } = require("tesseract.js");
const worker = createWorker();

(async () => {
  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
})();

const readTextFrom = async (buffer, scale) => {
  let img = await Jimp.read(buffer);
  img.greyscale().contrast(0.3).invert().scale(scale);
  let result = await worker.recognize(await img.getBase64Async(Jimp.MIME_PNG));
  let words = result.data.words.map(({ text, baseline }) => ({
    text,
    y: baseline.y0 / scale,
  }));
  return words;
};

const percentComparison = (first, second) => {
  return ([...first].reduce((total, letter) =>
    [...second].includes(letter) ? total + 1 : total, 0) / first.length) * 100
};

const sortWordsByItem = (words, itemHeight) => {
  let selected = [];
  words.forEach((word) => {
    if (!word.text || word.text.length < 2) return;
    let pos = selected[Math.floor(word.y / itemHeight)];
    if (!pos) {
      selected[Math.floor(word.y / itemHeight)] = word.text;
    } else {
      selected[Math.floor(word.y / itemHeight)] += ` ${word.text}`;
    }
  });

  return selected.flat();
};

module.exports = {
  percentComparison,
  readTextFrom,
  sortWordsByItem,
};
