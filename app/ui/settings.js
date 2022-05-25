const elt = require("./utils/elt.js");

const renderGameNames = ({game}) => {
  const gameNames = [
    "Retail&Classic",
    "MoP",
    "Cataclysm",
    "WoTLK",
    "TBC",
    "Vanilla",
  ];
  return elt(
    "select",
    { name: "game", className: "option game-option" },
    ...gameNames.map((name) =>
      elt("option", { selected: name == game }, name)
    )
  );
};

const renderTimer = ({timer}) => {
  return elt(
    "input",
    { type: "number", min: "0", value: timer, name: "timer", title: ""},
    `(min)`
  );
};

const wrapInLabel = (name, inner, hint) => {
  return elt(
    "label",
    null,
    name,
    elt(
      "div",
      { className: "option" },
      inner,
      elt("img", {
        src: "./img/hint.png",
        className: "option_hint",
        title: hint,
      })
    )
  );
};

const createShiftClick = ({shiftClick}) => {
  const dom = elt("input", {
    type: "checkbox",
    className: "option",
    checked: shiftClick,
    name: "shiftClick",
  });

  let saved = null;
  const syncState = (config) => {
    if (config.game == "Vanilla") {
      saved = dom.checked;
      dom.checked = true;
      dom.setAttribute("disabled", true);
    } else {
      if (saved != null) {
        dom.checked = saved;
        saved = null;
      }
      dom.removeAttribute("disabled");
    }
  };

  return {
    dom,
    syncState,
  };
};

const renderLikeHuman = ({likeHuman}) => {
  return elt("input", {
    type: "checkbox",
    className: "option",
    checked: likeHuman,
    name: "likeHuman",
  });
};

const renderLures = ({lures}) => {
  return elt("input", {
    type: "checkbox",
    className: "option",
    checked: lures,
    name: "lures",
  });
};

const createLuresKey = ({lures, luresKey}) => {
  const dom = elt('input', {type: 'text', value: luresKey, disabled: !lures, name: "luresKey"});

  const syncState = (config) => {
      !config.lures ? dom.setAttribute('disabled', 'true') : dom.removeAttribute('disabled');
  };

  return {
    dom,
    syncState
  }
}

const createLuresDelay = ({lures, luresDelayMin}) => {
  const dom = elt('input', {type: 'number', value: luresDelayMin, disabled: !lures, name: "luresDelayMin"});

  const syncState = (config) => {
      !config.lures ? dom.setAttribute('disabled', 'true') : dom.removeAttribute('disabled');
  };

  return {
    dom,
    syncState
  }
};

const renderFishingKey = ({fishingKey}) => {
  return elt('input', {type: 'text', value: fishingKey, name: "fishingKey"});
};

class Settings {
  constructor(config) {
    this.config = config;

    this.options = {
      gameNames: renderGameNames(config),
      timer: renderTimer(config),
      fishingKey: renderFishingKey(config),
      likeHuman: renderLikeHuman(config),
      lures: renderLures(config),
      shiftClick: createShiftClick(config),
      luresKey: createLuresKey(config),
      luresDelay: createLuresDelay(config)
    };

    this.dom = elt(
      "form",
      { className: "settings" },
      elt(
        "div",
        { className: "settings_section" },
        wrapInLabel(
          "Game:",
          this.options.gameNames,
          `Choose the patch you want the bot to work on.`
        ),
        wrapInLabel(
          "Timer: ",
          this.options.timer,
          `The bot will work for the given period of minutes. If it's 0 or nothing at all, it will never stop.`
        ),
        wrapInLabel(
          "Fishing Key: ",
          this.options.fishingKey,
          `Write in the same key you use for fishing. If you use /castFishing instead, then assign a key for fishing.`
        ),
        wrapInLabel(
          "Lures Key: ",
          this.options.luresKey.dom,
          `Write in the same key you use for using fishing lures.`
        )
      ),
      elt(
        "div",
        { className: "settings_section" },
        wrapInLabel(
          "Use shift+click: ",
          this.options.shiftClick.dom,
          `Use shift + click instead of Auto Loot. Check this option if you don't want to turn on Auto Loot option in the game. Your "Loot key" in the game should be assign to shift.`
        ),
        wrapInLabel(
          "Like a human: ",
          this.options.likeHuman,
          `The bot will move your mouse in a human way: random speed and with a slight random curvature. Otherwise it will move the mouse instantly, which might be a better option if you use a lot of windows. `
        ),
        wrapInLabel(
          "Use lures: ",
          this.options.lures,
          `Check this option if you want to use fishing lures.`
        ),
        wrapInLabel(
          "Reuse lure: ",
          this.options.luresDelay.dom,
          `Fishing lures expiration time in minutes. Usually it's 10 minutes.`
        )
      )
    );

    this.dom.addEventListener("change", (event) => {
      [...this.dom.elements].forEach(option => {
        let value = option.value;
        if (option.type == "checkbox") {
          value = option.checked;
        }

        if (option.type == "number") {
          value = Number(option.value);
        }

        this.config[option.name] = value;
      })

      if (event.target.name == "game") {
        this.onGameChange(event.target.value);
      }

      this.syncOptStates();
      this.onChange(this.config);
    });
  }


  syncOptStates() {
    for (let option of Object.keys(this.options)) {
      if(this.options[option].syncState) {
        this.options[option].syncState(this.config);
      }
    }
  }

  regOnGameChange(callback) {
    this.onGameChange = callback;
  }

  regOnChange(callback) {
    this.onChange = callback;
  }

  block() {
    [...this.dom.children].forEach(
      (option) => (option.children[0].disabled = true)
    );
  }

  unblock() {
    [...this.dom.children].forEach((option) =>
      option.children[0].removeAttribute("disabled")
    );
  }
}

module.exports = Settings;
