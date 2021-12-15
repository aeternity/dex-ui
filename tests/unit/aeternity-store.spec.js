import { getPriceImpact } from '../../src/store/modules/aeternity';

describe('aeternity module store', () => {
  it('price impact to be 0.5', () => {
    expect(getPriceImpact(2000000n, 1000n, 10000n)).toBe(0.5);
  });
  it('price impact to be 0.5', () => {
    expect(getPriceImpact(2000000n, 1000n, 100000n)).toBe(5);
  });
});
