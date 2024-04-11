const getPercent = (value, total) => {
  return Math.ceil((value / (total || 1)) * 100 * 100) / 100;
};

class Stats {
  constructor() {
    this.caught = 0;
    this.miss = 0;
    this.confused = 0;
    this.misspurpose = 0;
  }

  get total() {
    return this.caught + this.miss + this.misspurpose;
  }

  show() {
    return [
      `Total: ${this.total}`,
      `Caught: ${this.caught} (${getPercent(this.caught, this.total)}%)`,
      `Missed: ${this.miss} (${getPercent(this.miss, this.total)}%)`,
      `Missed on purpose: ${this.misspurpose} (${getPercent(this.misspurpose, this.total)}%)`,
      `Couldn't recognize: ${this.confused} (${getPercent(this.confused, this.total)}%)`
    ];
  }
}

module.exports = Stats;
