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

          event.target.textContent = this.state ? `STOP` : `START`;
        },
      },
      `START`
    );
  }

  onError() {
    this.state = false;
    this.dom.textContent = `START`;
  }

  regOnStart(callback) {
    this.onStart = callback;
  }

  regOnStop(callback) {
    this.onStop = callback;
  }
}

module.exports = StartButton;
