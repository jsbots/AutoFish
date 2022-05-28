const elt = require("./utils/elt.js");
const { ipcRenderer } = require("electron");

const parseInstruction = (instruction) => {
  if (!instruction) return ``;
  return instruction.map((step, i) => elt("p", null, `${++i}. ${step}`));
};

class AutoFish {
  constructor(instructions, settings, startButton) {
    const instruction = elt(
      "section",
      { className: "instruction" },
      ...parseInstruction(instructions[settings.config.game])
    );

    this.settings = settings;
    this.button = startButton;
    this.logger = renderLogger();

    this.settings.regOnChange((config) => ipcRenderer.send('save-settings', config));

    this.settings.regOnGameChange((game) => {
      instruction.innerHTML = ``;
      instruction.append(...parseInstruction(instructions[game]));
    });

    this.button.regOnStart(() => {
      ipcRenderer.send("start-bot", this.settings.config);
    });

    this.button.regOnStop(() => {
      ipcRenderer.send("stop-bot");
    });

    ipcRenderer.on("log-data", (event, data) => {
      this.logger.show(data);
    });

    ipcRenderer.on("stop-bot", () => {
      this.button.onError();
    });

    this.dom = elt(
      "div",
      { className: "AutoFish" },
      renderLogo(),
      elt("p", {className: 'settings_header'}, "Settings:"),
      this.settings.dom,
      elt("p", {className: 'settings_header'}, "Log:"),
      this.logger.dom,
      elt("p", {className: 'settings_header'}, "Instruction:"),
      instruction,
      this.button.dom,
      elt("p", {className: "version"}, "ver. 1.2.4")
    );
  }
}

const renderLogo = () => {
  return elt(
    "section",
    { className: "logo" },
    elt("h1", { className: "logo_name" }, `AutoFish`),
    elt(
      "span",
      { className: "logo_link" },
      `Made by `,
      elt(
        "a",
        { href: `#`, onclick: () => ipcRenderer.send("open-link") },
        "olesgeras"
      )
    )
  );
};

const renderLogger = () => {
  return {
    dom: elt("section", { className: `logger` }),
    show({ text, type }) {
      let row = elt("p", null, text);
      row.style.color = type;
      this.dom.append(row);
      this.dom.scrollTop += 30;
    },
  };
};

module.exports = AutoFish;
