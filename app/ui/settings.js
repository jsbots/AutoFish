const elt = require("./utils/elt.js");

class Settings {
  constructor(config, renderSettings) {
    this.config = config;
    this.dom = elt('form', null , renderSettings(config));

    this.dom.addEventListener("change", (event) => {
      [...this.dom.elements].forEach(option => {
        if(option.name == "advancedSettings") return;
        let value = option.value;
        if (option.type == "checkbox") {
          value = option.checked;
        }

        if (option.type == "number") {
          value = Number(option.value);
        }

        this.config[option.name] = value;
      });

      this.dom.innerHTML = ``;
      this.dom.append(renderSettings(config));
      this.onChange(this.config);
    });

    this.dom.addEventListener('click', (event) => {
      if(event.target.name == 'advancedSettings') {
        this.onClick(this.config);
      }
    })
  }

  regOnClick(callback) {
    this.onClick = callback;
  }

  regOnChange(callback) {
    this.onChange = callback;
  }
}

module.exports = Settings;
