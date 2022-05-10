const Rgb = require('../rgb.js');

describe('Rgb', () => {
  const size = 3;
  const data = new Array(size * size * 4).fill(true).map(() => 255);
  const zone = {x: 10, y: 10, width: size, height: size};
  const testZone = Rgb.from(data, zone);

  const isColor = ([r, g, b]) => {
    return r == 255 && g == 255 && b == 255;
  };

  describe('Rgb.from(data, zone)', () => {
    const {rgb} = testZone;
    it('Converts raw data to [r, g, b] representation from zone.x and zone.y position to zone.width and zone.height position', () => {
      expect(rgb).toHaveLength(zone.y + size);
      expect(rgb[zone.y]).toHaveLength(zone.x + size);
      expect(rgb[zone.y][zone.x]).toHaveLength(3);
    })
  });

  describe('rgb.findColor(color, task)', () => {
    it('Looks for the passed color within its rgb data and returns the position of it in relation to the whole screen', () => {
      const pos = testZone.findColor(isColor);
      expect(pos).toEqual({x: zone.x, y: zone.y})
    });

    it('Looks for the passed colors and passes it to task as additional condition if task is provided', () => {
      let pointFromTask;
      const pos = testZone.findColor(isColor, point => pointFromTask = point);
      expect(pointFromTask).toEqual(pos);
    });
  });

  describe('rgb.colorAt({x, y})', () => {
    it('Returns the color at the given position within the zone', () => {
      expect(isColor(testZone.colorAt({x: zone.x, y: zone.y}))).toBe(true);
    });
  });
});
