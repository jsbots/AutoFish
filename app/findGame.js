const {Virtual, Hardware, getAllWindows} = require('keysender');

const findGame = (name) => {
      const win = getAllWindows().find(({title, className}) => {
      if(new RegExp(name).test(title) &&
        (className == `GxWindowClass` || className == `GxWindowClassD3d`)) {
          return true;
        }
      });

      if(win) {
        return new Hardware(win.handle);
      }
};
