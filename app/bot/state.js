class State {
  constructor() {
    this.status = 'initial';
    this.stats = {caught: 0, miss: 0};
    this.time = Date.now();
  }
  caught(log) {
    if(this.status == 'working') {
      this.stats.caught++;
      log.ok(`Caught the fish!`);
    }
  }

  miss(log) {
    if(this.status == 'working') {
      this.stats.miss++;
      log.warn(`Missed the fish!`)
    }
  }

  showStats() {
    return `
      Total: ${this.stats.caught + this.stats.miss},
      Caught: ${this.stats.caught},
      Missed: ${this.stats.miss},
      Time Passed: ${(Date.now() - this.time) / 1000} sec
      `
  }
}

module.exports = State; 
