const {Virtual, Hardware, getAllWindows} = require('keysender');

class GameError extends Error{
  constructor() {
    super();
    this.message = `Can't find the window of the game!`
  }
};

const findGame = ({names, classNames}) => {
      const win = getAllWindows().find(({title, className}) =>  names.includes(title) && classNames.includes(className));
      if(win) {
        return new Hardware(win.handle);
      } else {
        throw new GameError();
      }
};

module.exports = findGame;
