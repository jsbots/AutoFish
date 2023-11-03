const elt = require("./elt.js");

const wrapInLabel = (name, inner, hint, classname) => {
  return elt(
    "label",
    {className: classname},
    name,
    elt(
      "div",
      { className: "option" },
      inner,
      hint ? (elt("img", {
        src: "./img/hint.png",
        className: "option_hint",
        title: hint,
      })) : ``
    )
  );
};

module.exports = wrapInLabel;
