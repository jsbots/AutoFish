const getPercent = (value, total) => {
  return Math.ceil((value / (total || 1)) * 100 * 100) / 100;
};

class Stats {
  constructor() {
    this.caught = 0;
    this.miss = 0;
  }

  get total() {
    return this.caught + this.miss;
  }

  show() {
    return [
      `Total: ${this.total}`,
      `Caught: ${this.caught} (${getPercent(this.caught, this.total)}%)`,
      `Missed: ${this.miss} (${getPercent(this.miss, this.total)}%)`,
    ];
  }
}

module.exports = Stats;
