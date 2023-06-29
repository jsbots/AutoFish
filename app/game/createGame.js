const { Hardware, getAllWindows } = require("keysender");

const findGameWindows = ({ names, classNames }) => {

  const wins = getAllWindows().filter(
    ({ title, className }) =>
      names.some(name => new RegExp(`${name}`).test(title)) && classNames.includes(className)
  );

  if (wins.length > 0) {
    return wins.map((win) => new Hardware(win.handle));
  }
};

module.exports = {
  findGameWindows,
  getAllWindows
};
