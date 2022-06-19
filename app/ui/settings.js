const elt = require("./utils/elt.js");

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
  constructor(config, renderSettings) {
    this.config = config;
    this.dom = elt('form', null , renderSettings(config));

    this.dom.addEventListener("input", (event) => {
      if((event.target.name == "fishingKey" || event.target.name =="luresKey") &&
        event.target.value.length > 1 && event.target.value.length != 0) {
        event.target.value = event.target.value[0];
      };
    });

    this.dom.addEventListener("change", (event) => {
      if(Object.keys(this.config).includes(event.target.name)) {
        this.config[event.target.name] = convertValue(event.target);
      }
      console.log(event.target.value);
      this.dom.innerHTML = ``;
      this.dom.append(renderSettings(this.config));

      [...this.dom.elements].forEach(option => {
        if(Object.keys(this.config).includes(option.name)) {
          this.config[option.name] = convertValue(option);
        }
      });

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
