const elt = require("./utils/elt.js");
const renderSettings = require("./renderSettings.js");
const renderBobber = require('./renderBobber.js');

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

    this.dom.addEventListener("input", (event) => {
      if((event.target.name == "fishingKey" || event.target.name =="luresKey") &&
        event.target.value.length > 1 && event.target.value.length != 0) {
        event.target.value = event.target.value[0];
      }
    });

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
        let canvas = this.dom.querySelector('.threshold_canvas');
        renderBobber(canvas.getContext(`2d`), event.target.value);
      }
    });

    this.dom.addEventListener('click', (event) => {

      if(event.target.name == `bobberColor`) {
        event.target.style = `background-image: url("./img/switch_${this.value == `red` ? `red` : `blue`}.png")`;
        event.target.value = event.target.value == `blue` ? `red` : `blue`;
        saveSettings(event);
        this.reRender();
      }

      if(event.target.name == 'advancedSettings') {
        this.onClick(this.config);
      }

      if(event.target.name == `fishingZone`) {
        this.onFishingZoneClick();
      }

      if(event.target.name == `chatZone`) {
        this.onChatZoneClick();
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
