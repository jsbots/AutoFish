const elt = require("./utils/elt.js");
const renderSettings = require("./renderSettings.js");

const convertValue = (node) => {
  let value = node.value;
  if (node.type == "checkbox") {
    value = node.checked;
  }

  if (node.type == "number") {
    value = Number(node.value) || 0;
  }

  return value;
};



class Settings {
  constructor(config) {
    this.config = config;
    this.dom = elt('form', null , renderSettings(config));

    const saveSettings = (event) => {
      if(Object.keys(this.config).includes(event.target.name)) {
        this.config[event.target.name] = convertValue(event.target);
      }
      this.dom.innerHTML = ``;
      this.dom.append(renderSettings(this.config));

      [...this.dom.elements].forEach(option => {
        if(Object.keys(this.config).includes(option.name)) {
          this.config[option.name] = convertValue(option);
        }
      });

      this.onChange(this.config);
    }

    this.dom.addEventListener("change", saveSettings);

    this.dom.addEventListener("input", (event) => {
      if(event.target.name == `threshold`) {
        this.dom.querySelectorAll('input[name=threshold]').forEach(node => {
          node.value = event.target.value
        });
      }
    });

    const keyAssigning = (event) => {
      event.target.value = event.key == ` `? `space` : event.key.toLowerCase();
      saveSettings(event);
      document.removeEventListener(`keydown`, keyAssigning);
      event.target.blur();
    }

    this.dom.addEventListener('mousedown', (event) => {
      if((event.target.name == `stopKey` || event.target.name == `fishingKey` || event.target.name == `luresKey` || event.target.name == `intKey`) && !event.target.disabled) {
        event.target.style.backgroundColor = `rgb(255, 104, 101)`;
        event.target.style.border = `1px solid grey`;

        event.target.addEventListener(`blur`, function bluring(event) {
          event.target.style.backgroundColor = `white`;
          event.target.style.border = `1px solid grey`;
          event.target.removeEventListener(`blur`, bluring);
          event.target.removeEventListener(`keydown`, keyAssigning);
        });

        event.target.addEventListener(`keydown`, keyAssigning);
      }
    });

    this.dom.addEventListener('click', (event) => {
      if(event.target.name == `bobberColor` || event.target.parentNode.name == `bobberColor`) {
        let bobberColorNode = this.dom.querySelector(`.bobberColorSwitch`);
        bobberColorNode.value = bobberColorNode.value == `red` ? `blue` : `red`;
        let eventDummy = {target: bobberColorNode};
        saveSettings(eventDummy);
        this.reRender();
      }

      if(event.target.name == `autoTh` || event.target.parentNode.name == `autoTh`) {
        let node = this.dom.querySelector(`.autoTh`);
        node.value = node.value ? false : true;
        let eventDummy = {target: node};
        saveSettings(eventDummy);
        this.reRender();
      }

      if(event.target.name == `multipleWindows` && event.target.checked == true) {
        this.onDx11();
      }

      if((event.target.name == `lures` && event.target.checked) && (config.game == `Retail` || config.game == `Classic` || config.game == `Vanilla` || config.game == `Vanilla (splash)`)) {
        this.onLures();
      }

      if(event.target.name == `whitelist` && event.target.checked == true) {
        this.onWhitelistWarn();
      }

      if(event.target.name == 'advancedSettings') {
        this.onClick(this.config);
      }

      if(event.target.name == `fishingZone`) {
        this.onFishingZoneClick();
      }
    })
  }

  reRender() {
    this.dom.innerHTML = ``;
    this.dom.append(renderSettings(this.config));
  }

  regOnClick(callback) {
    this.onClick = callback;
  }

  regOnDx11(callback) {
    this.onDx11 = callback;
  }

  regOnLures(callback) {
    this.onLures = callback;
  }

  regOnWhitelistWarn(callback) {
    this.onWhitelistWarn = callback;
  }

  regOnFishingZoneClick(callback) {
    this.onFishingZoneClick = callback;
  }

  regOnChatZoneClick(callback) {
    this.onChatZoneClick = callback;
  }

  regOnChange(callback) {
    this.onChange = callback;
  }
}

module.exports = Settings;
