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
const createShiftClick = (configShiftClick) => {
  const dom = elt('input', {type: 'checkbox', className: 'option', checked: !!configShiftClick, name: 'shiftClick'});
  let saved = null;
  return  {
    dom,
    syncState(game) {
      if(game == 'Vanilla') {
        saved = dom.checked;
        dom.checked = true;
        dom.setAttribute('disabled', true);
      } else {
        if(saved != null) {
          dom.checked = saved;
          saved = null;
        }
        dom.removeAttribute('disabled');
      }
    }
  }
};

const renderLikeHuman = (configLikeHuman) => {
  return elt('input', {type: 'checkbox', className: 'option', checked: !!configLikeHuman, name: 'likeHuman'});
}


class Settings {
  constructor(config) {
    this.config = config;
    const {game, timer, control, shiftClick, likeHuman, fishingKey} = config;

    this.options = {
      control: createControl(control),
      shiftClick: createShiftClick(shiftClick)
    }
    this.dom = elt('section', {className: 'settings'},
               elt('div', {className: 'settings_section'},
                wrapInLabel('Game:', renderGameNames(game), `Choose the patch you want the bot to work on.`),
                wrapInLabel('Timer: ', renderTimer(timer), `The bot will work for the given period of time. If it's 0 or nothing at all, it will never stop.`),
                wrapInLabel('Control: ', this.options.control.dom, `Hardware mode will open the window of the game and will directly use your mouse and keyboard. You should not use them while the bot is working or the bot will not work properly.`)
                ),
               elt('div', {className: 'settings_section'},
                wrapInLabel('Use shift + click: ', this.options.shiftClick.dom, `Use shift + click instead of Auto Loot. Check this option if you don't want to turn on Auto Loot option in the game, or if there's no such an option (like in Vanilla). Your "Loot key" in the game should be assign to shift.`),
                wrapInLabel('Like a human: ', renderLikeHuman(likeHuman), `The bot will move your mouse in a human way: random speed and with a slight random curvature. Otherwise it will move the mouse instantly, which might be a better option if you use many windows. `)
              )
              );

    this.dom.addEventListener('change', (event) => {
      const name = event.target.name;
      let value = event.target.value;

      if(name == 'shiftClick' || name == 'likeHuman') {
        this.config[name] = event.target.checked;
        return;
      }

      if(name == 'timer') {
        value = Number(value);
      }

      if(name == 'game') {
        this.onGameChange(value);
        for(let option of Object.keys(this.options)) {
          this.options[option].syncState(value);
        }
      }

      this.config[name] = value;
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
