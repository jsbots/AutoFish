class EventLine {
  constructor() {
    this.eventLine = [];
  }

  add(callback) {
    this.eventLine.push(callback);
    if (this.eventLine.length == 1) {
      callback();
    }
  }

  remove() {
    this.eventLine.shift();
    if (this.eventLine[0]) {
      this.eventLine[0]();
    }
  }
}

module.exports = EventLine;
