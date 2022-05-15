const createGame = ({Virtual, Hardware, getAllWindows}) => {
  return {
    findWindows({names, classNames, controlType}) {
      const wins = getAllWindows().filter(({title, className}) =>  names.includes(title) && classNames.includes(className));
      if(wins.length > 0) {
        if(controlType == 'virtual') {
          return wins.map((win) => new Virtual(win.handle));
        } else {
          return wins.map((win) => new Hardware(win.handle));
        }
      }
    }
  }
};

module.exports = createGame;
