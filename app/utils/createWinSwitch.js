const createWinSwitch = (eventLine) => {
  const reg = (callback) => {
    return new Promise((resolve) => {
      eventLine.add(() => {
        callback();
        resolve();
      });
    });
  };

  const unreg = () => {
    eventLine.remove();
  };

  return {
    reg,
    unreg
  };
};

module.exports = createWinSwitch;
