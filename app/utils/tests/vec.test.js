const Vec = require('../vec.js');

describe('Vec', () => {
  describe('plus(vec)', () => {
    it('Adds x, y of two vectors', () => {
      let result = new Vec(10, 10).plus(new Vec(10, 10));
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
      let result = new Vec(10, 10).getPointsAround();
      expect(result).toHaveLength(8);
      expect(result[0]).toMatchObject(new Vec(9, 9));
    })
  })
})
