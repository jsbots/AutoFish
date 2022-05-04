const {Virtual, Hardware, getAllWindows} = require('keysender');

class GameError extends Error{
  constructor() {
    super();
    this.message = `Can't find the window of the game!`
  }
};

const getGameControls = (name, log) => {
      const win = getAllWindows().find(({title, className}) => {
      if(new RegExp(name).test(title) &&
        (className == `GxWindowClass` || className == `GxWindowClassD3d`)) {
          return true;
        }
      });

      if(win) {
        return new Hardware(win.handle);
      } else {
        throw new GameError();
      }
};



module.exports = getGameControls;
