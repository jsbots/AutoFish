const getCurrentTime = () => {
  let date = new Date();
  let times = {hr: date.getHours(),min: date.getMinutes(), sec: date.getSeconds()};
  for(let time of Object.keys(times)) {
    times[time] = times[time].toString();
    if(times[time].length < 2) {
      times[time] = times[time].padStart(2, `0`);
    }
  }

  return times;
};

module.exports = getCurrentTime;
