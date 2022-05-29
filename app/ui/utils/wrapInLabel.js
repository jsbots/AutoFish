const elt = require("./elt.js");

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

module.exports = wrapInLabel;
