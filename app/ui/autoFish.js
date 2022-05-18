const elt = require('./utils/elt.js');
const { ipcRenderer } = require("electron");

const parseInstruction = (instruction) => {
  if(!instruction) return ``;
  return instruction.map((step, i) => elt('p', null, `${++i}. ${step}`))
}

class AutoFish {
  constructor(instructions, settings, startButton) {
    const instruction = elt('section', {className: 'instruction'},
      ...parseInstruction(instructions[settings.config.game]));

    this.settings = settings;
    this.button = startButton;
    this.logger = renderLogger();

    this.settings.regOnGameChange((game) => {
      instruction.innerHTML = ``;
      instruction.append(...parseInstruction(instructions[game]));
    })

    this.button.regOnStart(() => {
      this.settings.block();
      ipcRenderer.send('start-bot', this.settings.config);
    });

    this.button.regOnStop(() => {
      this.settings.unblock();
      ipcRenderer.send('stop-bot');
    });

    ipcRenderer.on('log-data', (event, data) => {
        this.logger.show(data);
    });

    ipcRenderer.on('stop-bot', (event) => {
      this.button.onError();
      this.settings.unblock();
    })

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
}

const renderLogo = () => {
  return elt('section', {className: 'logo'},
          elt('h1', {className: 'logo_name'}, `AutoFish`),
           elt('span', {className: 'logo_link'}, `Made by `,
            elt('a', {href: `#`, onclick: () => ipcRenderer.send('open-link')}, 'olesgeras')))
}

const renderLogger = () => {
  return {
    dom: elt('section', {className: `logger`}),
    show({text, type}) {
      let row = elt('p', null, text);
      row.style.color = type;
      this.dom.append(row);
      this.dom.scrollTop += 30;
    }
  };
};

module.exports = AutoFish;
