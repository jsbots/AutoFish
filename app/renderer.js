const { ipcRenderer } = require("electron");

function elt(type, props, ...children) {
  let dom = document.createElement(type);
  if (props) Object.assign(dom, props);
  for (let child of children) {
    if (typeof child != "string") dom.appendChild(child);
    else dom.appendChild(document.createTextNode(child));
  }
  return dom;
}

const renderGameNames = (configName) => {
  const gameNames = ['Retail&classic', 'MoP', 'Cataclysm', 'WoTLK', 'TBC', 'Vanilla'];
  return elt('select', {name: 'name'},
         ...gameNames.map((name) => elt('option', {selected: name == configName}, name)));
};
const renderTimer = (configTimer) => {
  return elt('input', {type: 'number', min: '1', value: configTimer, name: 'timer'}, `(min)`);
};
const renderControl = (configControl) => {
  const select = configControl == 'Hardware' ? true : false;
  return elt('select', {name: 'control'},
         elt('option', {selected: select}, 'Hardware'),
         elt('option', {selected: !select}, 'Virtual'));
};

const renderAutoLoot = (configAutoLoot) => {
  return elt('input', {type: 'checkbox', checked: !!configAutoLoot, name: 'autoLoot'})
};

const renderMultiple = (configMultiple) => {
  return elt('input', {type: 'checkbox', checked: !!configMultiple, name: 'multiple'});
}

class Settings {
  constructor(config) {
    this.config = config;
    const {name, timer, control, autoLoot, multiple} = config;

    this.dom = elt('section', {className: 'settings'},
               elt('label', null, `Game:`, renderGameNames(name)),
               elt('label', null, `Timer:`, renderTimer(timer)),
               elt('label', null, `Control:`,renderControl(control)),
               elt('label', null, `AutoLoot:`, renderAutoLoot(autoLoot)),
               elt('label', null, `Multiple windows:`, renderMultiple(multiple)));

    this.dom.addEventListener('change', (event) => {
      const value = event.target.value;
      const name = event.target.name;
      config[name] = value;
      if(name == 'name' && this.onGameChange)
        this.onGameChange(value);
      })
  }

  regOnGameChange(callback) {
    this.onGameChange = callback;
  }

  block() {
    [...this.dom.children].forEach(option => option.children[0].disabled = true);
  }

  unblock() {
    [...this.dom.children].forEach(option => option.children[0].removeAttribute('disabled'));
  }

}

class StartButton {
  constructor() {
    this.state = false;
    this.dom = elt('button', {className: 'startButton', onclick: (event) => {
      event.target.innerHTML = ``;
      if(this.state = !this.state) {
        this.onStart(event);
      } else {
        this.onStop(event);
      }
      event.target.append(this.state ? document.createTextNode(`start`) : document.createTextNode(`stop`));
    }}, `start`);
  }

  regOnStart(callback) {
    this.onStart = callback;
  }

  regOnStop(callback) {
    this.onStop = callback;
  }
}



class AutoFish {
  constructor(config) {
    const instruction = elt('section', {className: 'instruction'}, elt('pre', {}, config.instruction[config.name]));

    this.settings = new Settings(config);
    this.button = new StartButton();
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
      let row = document.createElement("p");
      row.innerHTML = text;
      row.style.color = type;
      this.dom.append(row);
      this.dom.scrollTop += 30; // not 30 but should be in relation to the size of text
    }
  };
};

const getSettings = async () => {
  return {name: 'MoP',
          timer: Infinity, // (Math.abs(+timerData.value) || Infinity) * 60 * 1000,
          control: 'Virtual',
          autoLoot: true,
          multiple: false,
          instruction: {
           "MoP": `
        1. Launch the game.
        2. Switch to DirectX 11 mode.
        3. Turn off Vertical Sync.
        4. Switch to Windowed(fullscreen) mode
        5. Equip your favorite fishpole.
        6. Assign your 'fishing' skill to the '2' key.
        7. Find a good place to fish (watch the video).
        8. Don't use your keyboard and mouse while the bot is working.
        9. You can press 'space' to stop the bot.
        `,
          "Retail&classic": `
          1. Launch the game.
          2. Switch to DirectX 11 mode.
          3. Turn off Vertical Sync.
          4. Switch to Windowed(fullscreen) mode
          5. Equip your favorite fishpole.
          6. Assign your 'fishing' skill to the '2' key.
          7. You can use either Hardware (with opened game) or Virtual (in the background) mode.
          8. Find a good place to fish (watch the video).
          `
          }
        };
};

const runApp = async () => {
  let autoFish = new AutoFish(await getSettings());
  document.querySelector('.AutoFish').append(autoFish.dom);
  ipcRenderer.on('log-data', (event, data) => {
    autoFish.log(data);
  })
};

runApp();
