const elt = require("./utils/elt.js");
const { ipcRenderer } = require("electron");

const renderLogo = () => {
  return elt(
    "div",
    { className: "logo" },
    elt("h1", { className: "logo_name" }, `AutoFish`),
    elt(
      "span",
      { className: "logo_link" },
      `by `,
      elt(`img`, { className: `logo_link_img`, src: `img/youtube.jpg` }),
      elt(
        "a",
        { href: `#`, onclick: () => ipcRenderer.send("open-link-youtube") },
        "jsbots"
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

class AutoFish {
  constructor(settings, startButton) {
    this.settings = settings;
    this.button = startButton;
    this.logger = renderLogger();
    const versionNode = elt("span");
    const donateLink = elt(
      "a",
      {
        href: `#`,
        className: "donateLink",
        onclick: () => ipcRenderer.send("open-link-donate"),
      },
      `Donate`
    );
    const footer = elt(`p`, { className: "version" }, versionNode, donateLink);

    ipcRenderer.on("set-version", (event, version) => {
      versionNode.textContent = `ver. ${version} | `;
    });
    this.settings.regOnChange((config) => {
      ipcRenderer.send("save-settings", config);
    });

    this.settings.regOnClick((config) => {
      ipcRenderer.send("advanced-settings", config);
    });

    this.settings.regOnFishingZoneClick(() => {
      ipcRenderer.send("start-bot", `setFishingZone`);
    });

    this.button.regOnStart(() => {
      ipcRenderer.send("start-bot");
    });

    this.button.regOnStop(() => {
      ipcRenderer.send("stop-bot");
    });

    ipcRenderer.on("settings-change", (settings) => {
      this.settings.config = settings;
      this.settings.render();
    });

    ipcRenderer.on("stop-bot", () => {
      this.button.onError();
    });

    ipcRenderer.on("log-data", (event, data) => {
      this.logger.show(data);
    });

    this.dom = elt(
      "div",
      { className: "AutoFish" },
      renderLogo(),
      elt("p", { className: "settings_header" }, "Settings:"),
      this.settings.dom,
      elt("p", { className: "settings_header" }, "Log:"),
      this.logger.dom,
      this.button.dom,
      footer
    );
  }
}

module.exports = AutoFish;
