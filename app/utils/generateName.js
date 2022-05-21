const generateName = (size) => {
  let alphabet = `AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890`;
  return new Array(size)
  .fill(true)
  .map(slot => alphabet[Math.floor(Math.random() * alphabet.length)])
  .join(``);
};

module.exports = generateName; 
