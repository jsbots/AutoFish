class FishingState {
  constructor() {
    this.status = 'initial';
    this.stats = {caught: 0, miss: 0};
    this.time = Date.now();
  }

  caught(onCaught) {
    if(this.status == 'working') {
      onCaught(this.stats.caught++);
    }
  }

  miss(onMiss) {
    if(this.status == 'working') {
      onMiss(this.stats.miss++);
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

module.exports = FishingState;
