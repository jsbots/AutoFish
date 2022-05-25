const elt = require("./utils/elt.js");

const renderGameNames = ({name}) => {
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
    { name: "game", className: "option" },
    ...gameNames.map((gameName) =>
      elt("option", { selected: gameName == name }, gameName)
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
  const syncState = ({name, value}) => {
    if(name != 'game') return;

    if (value == "Vanilla") {
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

  const syncState = ({name, value}) => {
    if(name == 'lures') {
      !value ? dom.setAttribute('disabled', 'true') : dom.removeAttribute('disabled');
    }
  };

  return {
    dom,
    syncState
  }
}

const createLuresDelay = ({lures, luresDelayMin}) => {
  const dom = elt('input', {type: 'text', value: luresDelayMin, disabled: !lures, name: "luresDelayMin"});

  const syncState = ({name, value}) => {
    if(name == 'lures') {
      !value ? dom.setAttribute('disabled', 'true') : dom.removeAttribute('disabled');
    }
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
      shiftClick: createShiftClick(config),
      luresKey: createLuresKey(config),
      luresDelay: createLuresDelay(config)
    };

    this.dom = elt(
      "section",
      { className: "settings" },
      elt(
        "div",
        { className: "settings_section" },
        wrapInLabel(
          "Game:",
          renderGameNames(config),
          `Choose the patch you want the bot to work on.`
        ),
        wrapInLabel(
          "Timer: ",
          renderTimer(config),
          `The bot will work for the given period of time. If it's 0 or nothing at all, it will never stop.`
        ),
        wrapInLabel(
          "Fishing Key",
          renderFishingKey(config),
          `Write in the same key you use for fishing.`
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
          renderLikeHuman(config),
          `The bot will move your mouse in a human way: random speed and with a slight random curvature. Otherwise it will move the mouse instantly, which might be a better option if you use a lot of windows. `
        ),
        wrapInLabel(
          "Use lures: ",
          renderLures(config),
          `Check this option if you want to use fishing lures.`
        ),
        wrapInLabel(
          "Lures time: ",
          this.options.luresDelay.dom,
          `Fishing lures expiration time. Usually it's 10 min.`
        )
      )
    );

    this.dom.addEventListener("change", (event) => {
      const name = event.target.name;
      let value = event.target.value;

      if (name == "game") {
        this.onGameChange(value);
      }

      if (name == "shiftClick" || name == "likeHuman" || name == "lures") {
        value = event.target.checked;
      }

      if (name == "timer" || name == "luresDelayMin") {
        value = Number(value);
      }

      this.syncOptStates({name, value});
      this.config[name] = value;
      this.onChange(this.config);
    });
  }

  syncOptStates({name, value}) {
    for (let option of Object.keys(this.options)) {
      this.options[option].syncState({name, value});
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
