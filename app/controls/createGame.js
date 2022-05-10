class GameError extends Error{
  constructor() {
    super();
    this.message = `Can't find the window of the game!`
  }
};

const createGame = ({Virtual, Hardware, getAllWindows}) => {
  return {
    findGame({names, classNames, controlType}) {
      const win = getAllWindows().find(({title, className}) =>  names.includes(title) && classNames.includes(className));
      if(win) {
        if(controlType == 'virtual') {
          return new Virtual(win.handle);
        } else {
          return new Hardware(win.handle);
        }
      } else {
        throw new GameError();
      }
    }
  }
};

module.exports = createGame;
