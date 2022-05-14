class EventLine {
  constructor() {
    this.eventLine = [];
  }

  add(resolve) {
    this.eventLine.push(resolve);
    if (this.eventLine.length == 1) {
      resolve();
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
