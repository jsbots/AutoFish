const elt = require('./utils/elt.js');

const renderGameNames = (configName) => {
  const gameNames = ['Retail&Classic', 'MoP', 'Cataclysm', 'WoTLK', 'TBC', 'Vanilla'];
  return elt('select', {name: 'game', className: 'option'},
         ...gameNames.map((name) => elt('option', {selected: name == configName}, name)));
};

const renderTimer = (configTimer) => {
  return elt('input', {type: 'number', min: '1', value: configTimer, name: 'timer'}, `(min)`);
};

const wrapInLabel = (name, inner, hint) => {
  return elt('label', null, name,
         elt('div', {className: 'option'},
          inner,
         elt('img', {src: './img/hint.png', className:'option_hint', title: hint})));
}

const createControl = (configControl) => {
  const select = configControl == 'Hardware' ? true : false;
  const dom = elt('select', {name: 'control', className: 'option'},
              elt('option', {selected: select}, 'Hardware'),
              elt('option', {selected: !select}, 'Virtual'));
  return {
    dom,
    syncState(game) {
      if(game != 'Retail&Classic') {
        dom.children[0].selected = true;
        dom.children[1].disabled = true;
      } else {
        dom.children[1].removeAttribute('disabled');
      }
    }
  }
};
const createAutoLoot = (configAutoLoot) => {
  const dom = elt('input', {type: 'checkbox', className: 'option', checked: !!configAutoLoot, name: 'autoLoot'});
  return  {
    dom,
    syncState(game) {
      if(game == 'Vanilla') {
        dom.checked = true;
        dom.setAttribute('disabled', true);
      } else {
        dom.removeAttribute('disabled');
      }
    }
  }
};

const renderMultiple = (configMultiple) => {
  return elt('input', {type: 'checkbox', className: 'option', checked: !!configMultiple, name: 'multiple'});
}


class Settings {
  constructor(config) {
    this.config = config;
    const {name, timer, control, autoLoot, multiple, fishingKey} = config;
    this.options = {
      control: createControl(control),
      autoLoot: createAutoLoot(autoLoot)
    }
    this.dom = elt('section', {className: 'settings'},
               elt('div', {className: 'settings_section'},
                wrapInLabel('Game:', renderGameNames(name), `Choose the patch you want the bot to work on.`),
                wrapInLabel('Timer: ', renderTimer(timer), 'The bot will work for the provided period of time. If 0 it will never stop.'),
                wrapInLabel('Control: ', this.options.control.dom, `Hardware mode will open the window of the game and will directly use you mouse and keyboard. You won't be able to use the computer while the bot is working.`)
                ),
               elt('div', {className: 'settings_section'},
                wrapInLabel('AutoLoot: ', this.options.autoLoot.dom, `Use shift + click instead of Auto Loot. Check this option if you don't want to turn on Auto Loot option in the game, or if there's no such an option (like in Vanilla)`),
                wrapInLabel('Multiple windows: ', renderMultiple(multiple), `The bot will look for all the windows named "World of Warcraft" and start fishing on them.`)
              )
              );

    this.dom.addEventListener('change', (event) => {
      const value = event.target.value;
      const name = event.target.name;
      config[name] = value;
      if(name == 'game') {
        this.onGameChange(value);
        for(let option of Object.keys(this.options)) {
          this.options[option].syncState(value);
        }
      }

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

module.exports = Settings;
