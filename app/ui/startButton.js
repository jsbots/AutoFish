const elt = require('./utils/elt.js');

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

module.exports = StartButton;
