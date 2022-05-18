class Stats {
  constructor() {
    this.caught = 0;
    this.miss = 0;
  }

  showStats() {
    return `
        Total: ${this.caught + this.miss},
        Caught: ${this.caught},
        Missed: ${this.miss}
        `;
  }
}

module.exports = Stats;
