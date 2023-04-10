const elt = require("./utils/elt.js");

class StartButton {
  constructor() {
    this.state = false;
    this.dom = elt(
      "button",
      {
        className: "startButton",
        onclick: (event) => {
          event.target.innerHTML = ``;
          if ((this.state = !this.state)) {
            this.onStart();
          } else {
            this.onStop();
          }

          if(this.state) {
            this.dom.style.backgroundImage = `url('img/stop.png')`;
          } else {
            this.dom.style.backgroundImage = `url('img/start.png')`;
          }
        },
      },
    );
  }

  onError() {
    this.state = false;
    this.dom.style.backgroundImage = `url('img/start.png')`;
  }

  regOnStart(callback) {
    this.onStart = callback;
  }

  regOnStop(callback) {
    this.onStop = callback;
  }
}

module.exports = StartButton;
