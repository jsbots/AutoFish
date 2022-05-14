const elt = require('./utils/elt.js');

const renderGameNames = (configName) => {
  const gameNames = ['Retail&classic', 'MoP', 'Cataclysm', 'WoTLK', 'TBC', 'Vanilla'];
  return elt('select', {name: 'name', className: 'option'},
         ...gameNames.map((name) => elt('option', {selected: name == configName}, name)));
};

const renderTimer = (configTimer) => {
  return elt('input', {type: 'number', min: '1', className: 'option', value: configTimer, name: 'timer'}, `(min)`);
};

const renderControl = (configControl) => {
  const select = configControl == 'Hardware' ? true : false;
  return elt('select', {name: 'control', className: 'option'},
         elt('option', {selected: select}, 'Hardware'),
         elt('option', {selected: !select}, 'Virtual'));
};

const renderAutoLoot = (configAutoLoot) => {
  return elt('input', {type: 'checkbox', className: 'option', checked: !!configAutoLoot, name: 'autoLoot'})
};

const renderMultiple = (configMultiple) => {
  return elt('input', {type: 'checkbox', className: 'option', checked: !!configMultiple, name: 'multiple'});
}

class Settings {
  constructor(config) {
    this.config = config;
    const {name, timer, control, autoLoot, multiple} = config;

    this.dom = elt('section', {className: 'settings'},
               elt('div', null,
                elt('label', null, `Game:`, renderGameNames(name)),
                elt('label', null, `Timer:`, renderTimer(timer)),
                elt('label', null, `Control:`,renderControl(control))
               ),
               elt('div', null,
                elt('label', null, `AutoLoot:`, renderAutoLoot(autoLoot)),
                elt('label', null, `Multiple windows:`, renderMultiple(multiple)))
              );

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

module.exports = Settings;
