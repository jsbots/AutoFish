const elt = require('./utils/elt.js');

class AutoFish {
  constructor(config, settings, startButton) {
    const instruction = elt('section', {className: 'instruction'}, elt('pre', {}, config.instruction[config.name]));

    this.settings = settings;
    this.button = startButton;
    this.logger = renderLogger();

    this.settings.regOnGameChange((game) => {
      instruction.innerHTML = ``
      instruction.append(elt('pre', {}, config.instruction[game] || ``));
    })

    this.button.regOnStart(() => {
      ipcRenderer.send('start-bot', this.settings.config);
      this.settings.block();
    });

    this.button.regOnStop(() => {
      ipcRenderer.send('stop-bot');
      this.settings.unblock();
    });

    this.dom = elt('div', {},
                   renderLogo(),
                   elt('h3', null, 'Settings:'),
                   this.settings.dom,
                   elt('h3', null, 'Log:'),
                   this.logger.dom,
                   elt('h3', null, 'Instruction:'),
                   instruction,
                   this.button.dom);
  }

  log(data) {
    this.logger.show(data);
  }
}

const renderLogo = () => {
  return elt('h1', {className: 'logo_name'}, `AutoFish`)
}

const renderLogger = () => {
  return {
    dom: elt('div', {className: `logger`}),
    show({text, type}) {
      let row = elt('p', null, text);
      row.style.color = type;
      this.dom.append(row);
      this.dom.scrollTop += 30;
    }
  };
};

module.exports = AutoFish;
