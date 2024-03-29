let { mouse, Point } = require("@nut-tree/nut-js");

function getRandomControlPoint(start, end, range) {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;

    const controlPoint1 = {
        x: start.x + range * deltaX + Math.random() * range * deltaX,
        y: start.y + range * deltaY + Math.random() * range * deltaY,
    };

    const controlPoint2 = {
        x: start.x + (1 - range) * deltaX + Math.random() * range * deltaX,
        y: start.y + (1 - range) * deltaY + Math.random() * range * deltaY,
    };

    const controlPoint3 = {
        x: start.x + Math.random() * deltaX,
        y: start.y + Math.random() * deltaY,
    };

    return [controlPoint1, controlPoint2, controlPoint3];
}

function generateBezierPath(startPoint, endPoint, steps, range) {
    const controlPoints = getRandomControlPoint(startPoint, endPoint, range);
    const path = [];

    for (let t = 0; t <= 1; t += 1 / steps) {
        const x = Math.pow(1 - t, 3) * startPoint.x +
                  3 * Math.pow(1 - t, 2) * t * controlPoints[0].x +
                  3 * (1 - t) * Math.pow(t, 2) * controlPoints[1].x +
                  Math.pow(t, 3) * endPoint.x;

        const y = Math.pow(1 - t, 3) * startPoint.y +
                  3 * Math.pow(1 - t, 2) * t * controlPoints[0].y +
                  3 * (1 - t) * Math.pow(t, 2) * controlPoints[1].y +
                  Math.pow(t, 3) * endPoint.y;

        path.push({ x, y });
    }

    return path;
}


const random = (from, to) => {
  return from + Math.random() * (to - from);
};

const sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

function randomHumanLikeCursorEasing(x) {
    const oscillation = Math.sin(x * Math.PI) + (Math.random() - 0.5) * 0.1;
    const increasedEasingOut = 1 - Math.pow(1 - x, 4) + (Math.random() - 0.5) * 0.1;
    const result = 0.7 * oscillation + 0.3 * increasedEasingOut;
    return Math.max(0, Math.min(1, result));
}

module.exports = {
  mouse: {
  async humanMoveTo({from, to, speed, deviation, fishingZone}) {
    const distance = Math.sqrt(Math.pow(Math.round(from.x - to.x), 2) + Math.pow(Math.round(from.y - to.y), 2));
    const fZoneSize = Math.sqrt(Math.pow(fishingZone.width, 2) + Math.pow(fishingZone.height, 2)) * .25;
    /* apply distance relation to zone size only if distance is more than 5% */
    mouse.config.mouseSpeed = (speed * 100 * 20) * (distance > fZoneSize * .05 ? distance / fZoneSize : 0.25);
    const bezierPath = generateBezierPath(from, to, distance, deviation / 150);
    await mouse.move(bezierPath, randomHumanLikeCursorEasing);
  },
  async toggle(button, type, delay) {
    let buttonNumber = button == `left` ? 1 : button == `right` ? 2 : 3;
    if(type == true) {
      await mouse.pressButton(buttonNumber);
    } else {
      await mouse.releaseButton(buttonNumber);
    }

    if(Array.isArray(delay)) {
      await sleep(random(delay[0], delay[1]))
    } else {
      await sleep(delay);
    }
    }
  }
}
