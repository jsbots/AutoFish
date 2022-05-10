const Vec = require('../vec.js');

describe('Vec', () => {
  const vec = new Vec(10, 10);
  describe('plus(vec)', () => {
    it('Adds x, y of two vectors', () => {
      let result = vec.plus(new Vec(10, 10));
      expect(result.x).toBe(20);
      expect(result.y).toBe(20);
    })
  });
  describe('get dist()', () => {
    it('Calculates distance from 0 to vector point using pythagorean theorem', () => {
      let result = Math.floor((new Vec(2, 2).dist) * 10);
      expect(result).toBe(28);
    })
  });
  describe('getPointsAround(size)', () => {
    it('Returns vectors around the vector at given size', () => {
      let result = vec.getPointsAround();
      expect(result).toHaveLength(8);
      expect(result[0]).toMatchObject({
        x: 9,
        y: 9
      });
    })
  })
})
