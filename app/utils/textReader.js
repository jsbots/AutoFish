const Jimp = require("jimp");
const { createWorker } = require("tesseract.js");

const worker = createWorker();

const setWorker = async (language) => {
  await worker.load();
  await worker.loadLanguage(language);
  await worker.initialize(language);
};

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

const getField = (attr) => (obj) => obj[attr];
const percentComparison = (first, second) => {
  if (second.length > first.length) {
    [first, second] = [second, first];
  }

  let mainLetters = Array.from(new Set([...first])).map(letter => ({letter, index: []}));
  [...first].forEach(letter => {
    let prevIndexes = mainLetters.find((mainLetter) => mainLetter.letter == letter).index;
    let lastPrevIndex = prevIndexes[prevIndexes.length - 1];
    let index = second.indexOf(letter, lastPrevIndex ? lastPrevIndex + 1 : 0);
    if(index != -1) {
      prevIndexes.push(index);
    }
  });

  return mainLetters.flatMap(getField(`index`)).length / first.length * 100
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
  setWorker,
  percentComparison,
  readTextFrom,
  sortWordsByItem,
};
