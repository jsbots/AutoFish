const elt = require("./utils/elt.js");
const { ipcRenderer } = require("electron");

const renderLogo = () => {
  return elt(
    "div",
    { className: "logo" },
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
    const premiumIcon = elt(`img`, { className: `premium_icon`, src: `img/premium.png` });
    const versionNode = elt("span");
    const donateLink = elt(
      "a",
      {
        href: `#`,
        className: "donateLink",
        onclick: () => ipcRenderer.send("open-link-donate"),
      },
      `AutoFish Premium`
    );
    const footer = elt(`p`, { className: "version" }, versionNode, donateLink, premiumIcon);

    ipcRenderer.on("set-version", (event, version) => {
      versionNode.textContent = `ver. 2.1.0 Beta Public | `;
    });
    this.settings.regOnChange((config) => {
      ipcRenderer.send("save-settings", config);
    });

    this.settings.regOnClick((config) => {
      ipcRenderer.send("advanced-settings", config);
    });

    this.settings.regOnFishingZoneClick(() => {
      ipcRenderer.send("start-bot", `relZone`);
    });

    this.settings.regOnChatZoneClick(() => {
      ipcRenderer.send("start-bot", `chatZone`);
    });

    this.settings.regOnDx11(() => {
      ipcRenderer.send("dx11-warn");
    });

    this.settings.regOnLures(() => {
      ipcRenderer.send(`lures-warn`);
    });

    this.settings.regOnWhitelistWarn(() => {
      ipcRenderer.send("whitelist-warn");
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
      elt("p", { className: "settings_header" }, "Settings"),
      this.settings.dom,
      elt("p", { className: "settings_header settings_header_log" }, "Log"),
      this.logger.dom,
      this.button.dom,
      footer
    );
  }
}

module.exports = AutoFish;
