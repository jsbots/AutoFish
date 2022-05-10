const Rgb = require('../rgb.js');

describe('Rgb', () => {
  const size = 3;
  const data = new Array(size * size * 4).fill(true).map(() => Math.floor(Math.random() * 255));
  const zone = {x: 10, y: 10, width: size, height: size};
  const {rgb} = Rgb.from(data, zone);

  describe('Rgb.from(data, zone)', () => {
    it('Converts raw data to [r, g, b] representation from zone.x and zone.y position to zone.width and zone.height position', () => {
      expect(rgb).toHaveLength(zone.y + size);
      expect(rgb[zone.y]).toHaveLength(zone.x + size);
      expect(rgb[zone.y][zone.x]).toHaveLength(3);
    })
  })
});
