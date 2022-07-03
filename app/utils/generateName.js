const range = (start, end) => new Array(end - start).fill(true).map((a, i) => start + i);

const generateName = (size) => {
  let combined = [...range(`a`.charCodeAt(), `z`.charCodeAt()),
                  ...range(`A`.charCodeAt(), `Z`.charCodeAt()),
                  ...range(`0`.charCodeAt(), `9`.charCodeAt())];

  return new Array(size)
    .fill(true)
    .map(() => combined[Math.floor(Math.random() * (combined.length - 1))])
    .map((random) => String.fromCharCode(random))
    .join(``);
};

module.exports = generateName;
