import { describe, it, expect } from 'vitest';

import {
  ratioFromRoute,
  ratioWithDecimals,
  getPath,
  getRouteReserves,
  getPriceImpactForRoute,
  getReceivedTokensForPairReserves,
} from '@/lib/swapUtils';

describe('get path tests', () => {
  const A = 'a';
  const B = 'b';
  const C = 'c';
  const path = (route, tokenA) =>
    getPath(
      route.map((x) => ({
        ...x,
        token0: x.t0,
        token1: x.t1,
      })),
      tokenA,
    );
  it('gets nothing from empty route', () => {
    expect(getPath([], 'ct_1')).toEqual([]);
  });
  const testPath = (input, token, result) =>
    it(`gets ${JSON.stringify(result)} from route ${JSON.stringify(input)}`, () => {
      expect(path(input, token)).toEqual(result);
    });
  testPath([{ t0: A, t1: B }], A, [A, B]);
  testPath([{ t0: B, t1: A }], A, [A, B]);
  testPath(
    [
      { t0: A, t1: B },
      { t0: B, t1: C },
    ],
    A,
    [A, B, C],
  );
  testPath(
    [
      { t0: B, t1: C },
      { t0: A, t1: B },
    ],
    A,
    [A, B, C],
  );

  describe('test longer paths', () => {
    const range = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const input = range
      .slice(1)
      .reduce(([acc, prev], x) => [acc.concat({ t0: prev, t1: x }), x], [[], range[0]])[0];
    testPath(input, range[0], range);
    testPath([...input].reverse(), range[0], range);
    testPath(input, range[range.length - 1], [...range].reverse());
    testPath([...input].reverse(), range[range.length - 1], [...range].reverse());
  });
});
describe('route price impact', () => {
  const toPair = ([[token0, reserve0], [token1, reserve1]]) => ({
    token0,
    token1,
    liquidityInfo: {
      reserve0,
      reserve1,
    },
  });
  const toPairs = (xs) => xs.map(toPair);
  const priceImpact = (xs, tokenA, amountA) => getPriceImpactForRoute(toPairs(xs), tokenA, amountA);
  it('price impact to be 0.5', () => {
    expect(
      priceImpact(
        [
          [
            ['a', 2000000n],
            ['b', 1000n],
          ],
        ],
        'a',
        10000n,
      ),
    ).toBe(0.5);
  });
  it('price impact to be 5', () => {
    expect(
      priceImpact(
        [
          [
            ['a', 2000000n],
            ['b', 1000n],
          ],
        ],
        'a',
        100000n,
      ),
    ).toBe(5);
  });
  it('should receive 1', () => {
    expect(getReceivedTokensForPairReserves([[2, 2]], 2).toNumber()).toBe(1);
  });
  it('should received 0.6666666666666666', () => {
    expect(
      getReceivedTokensForPairReserves(
        [
          [2, 2],
          [2, 2],
        ],
        2,
      ).toNumber(),
    ).toBe(0.6666666666666666);
  });

  it('swapping reserveA will have priceImpact=100%', () => {
    expect(
      priceImpact(
        [
          [
            ['a', 2],
            ['b', 2],
          ],
        ],
        'a',
        2,
      ),
    ).toBe(100);
  });

  it('swapping reserveA withing two pairs will have priceImpact=200%', () => {
    expect(
      priceImpact(
        [
          [
            ['a', 2],
            ['b', 2],
          ],
          [
            ['b', 2],
            ['c', 2],
          ],
        ],
        'a',
        2,
      ),
    ).toBe(200);
  });
  it('swapping reserveA withing 3 pairs will have priceImpact=300%', () => {
    expect(
      priceImpact(
        [
          [
            ['a', 2],
            ['b', 2],
          ],
          [
            ['b', 2],
            ['c', 2],
          ],
          [
            ['c', 2],
            ['d', 2],
          ],
        ],
        'a',
        2,
      ),
    ).toBe(300);
  });
  it('swapping 25 for [[100,50],[25,25]] will have priceImpact=75%', () => {
    expect(
      priceImpact(
        [
          [
            ['a', 100],
            ['b', 50],
          ],
          [
            ['a', 25],
            ['b', 25],
          ],
        ],
        'a',
        25,
      ),
    ).toBe(75);
  });
});
describe('get route reserves', () => {
  const toPair = ([[token0, reserve0], [token1, reserve1]]) => ({
    token0,
    token1,
    liquidityInfo: {
      reserve0,
      reserve1,
    },
  });
  const toPairs = (xs) => xs.map(toPair);
  const getReserves = (xs, tokenA) => getRouteReserves(toPairs(xs), tokenA);
  it('no reserves for no route', () => {
    expect(getReserves([], 'a')).toEqual([]);
  });

  it('gets for one ordered pair ', () => {
    expect(
      getReserves(
        [
          [
            ['a', 1],
            ['b', 2],
          ],
        ],
        'a',
      ),
    ).toEqual([[1, 2]]);
  });

  it('gets for one pair in reverse order ', () => {
    expect(
      getReserves(
        [
          [
            ['a', 1],
            ['b', 2],
          ],
        ],
        'b',
      ),
    ).toEqual([[2, 1]]);
  });

  it('getReserves for a route with two pairs #1', () => {
    expect(
      getReserves(
        [
          [
            ['a', 1],
            ['b', 2],
          ],
          [
            ['c', 3],
            ['b', 4],
          ],
        ],
        'a',
      ),
    ).toEqual([
      [1, 2],
      [4, 3],
    ]);
  });
  it('getReserves for a route with two pairs #2', () => {
    expect(
      getReserves(
        [
          [
            ['a', 1],
            ['b', 2],
          ],
          [
            ['b', 3],
            ['c', 4],
          ],
        ],
        'a',
      ),
    ).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });
  it('getReserves for a route with two pairs #2', () => {
    expect(
      getReserves(
        [
          [
            ['b', 1],
            ['a', 2],
          ],
          [
            ['b', 3],
            ['c', 4],
          ],
        ],
        'a',
      ),
    ).toEqual([
      [2, 1],
      [3, 4],
    ]);
  });
  it('getReserves for a route with two pairs in revers order with the end', () => {
    expect(
      getReserves(
        [
          [
            ['b', 3],
            ['c', 4],
          ],
          [
            ['b', 1],
            ['a', 2],
          ],
        ],
        'a',
      ),
    ).toEqual([
      [2, 1],
      [3, 4],
    ]);
  });
  it('getReserves for a route with multiple pairs (> 2) #1', () => {
    expect(
      getReserves(
        [
          [
            ['a', 1],
            ['b', 2],
          ],
          [
            ['b', 3],
            ['c', 4],
          ],
          [
            ['c', 5],
            ['d', 6],
          ],
          [
            ['d', 7],
            ['e', 8],
          ],
        ],
        'a',
      ),
    ).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
    ]);
  });
  it('getReserves for a route with multiple pairs (> 2) #2', () => {
    expect(
      getReserves(
        [
          [
            ['a', 1],
            ['b', 2],
          ],
          [
            ['c', 3],
            ['b', 4],
          ],
          [
            ['d', 5],
            ['c', 6],
          ],
          [
            ['d', 7],
            ['e', 8],
          ],
        ],
        'a',
      ),
    ).toEqual([
      [1, 2],
      [4, 3],
      [6, 5],
      [7, 8],
    ]);
  });
  it('getReserves for a route with multiple pairs (> 2) in reverse', () => {
    expect(
      getReserves(
        [
          [
            ['a', 1],
            ['b', 2],
          ],
          [
            ['b', 3],
            ['c', 4],
          ],
          [
            ['c', 5],
            ['d', 6],
          ],
          [
            ['d', 7],
            ['e', 8],
          ],
        ],
        'e',
      ),
    ).toEqual([
      [8, 7],
      [6, 5],
      [4, 3],
      [2, 1],
    ]);
  });
});
const ratioFromPair = (pair, tokenA) => ratioFromRoute([pair], tokenA);
describe('ratio from one pair', () => {
  it('simple 1/1 pair', () => {
    expect(
      ratioFromPair(
        {
          token0: 'ct_1',
          liquidityInfo: {
            reserve0: 1n,
            reserve1: 1n,
          },
        },
        'ct_1',
      ).toString(),
    ).toBe('1');
  });
  it('gets ratio in form of reserve1/reserve0', () => {
    expect(
      ratioFromPair(
        {
          token0: 'ct_1',
          liquidityInfo: {
            reserve0: 1000n,
            reserve1: 2000n,
          },
        },
        'ct_1',
      ).toString(),
    ).toBe('2');
  });
  it('gets ratio in form of reserve1/reserve0', () => {
    expect(
      ratioFromPair(
        {
          token0: 'ct_2',
          liquidityInfo: {
            reserve0: 1000n,
            reserve1: 2000n,
          },
        },
        'ct_1',
      ).toString(),
    ).toBe('0.5');
  });
});
describe('ratio with decimals', () => {
  it('get ratio with decimals when tokenA decimals ar less', () => {
    const ratio = ratioFromPair(
      {
        token0: 'ct_1',
        liquidityInfo: {
          reserve0: 10n,
          reserve1: 4000n,
        },
      },
      'ct_1',
    );
    expect(ratioWithDecimals(ratio, { decimalsA: 1, decimalsB: 3 }).toString()).toBe('4');
  });
  it('get ratio with decimals when tokenA decimals ar greater', () => {
    const ratio = ratioFromPair(
      {
        token0: 'ct_1',
        liquidityInfo: {
          reserve0: 200n,
          reserve1: 4n,
        },
      },
      'ct_1',
    );
    expect(ratioWithDecimals(ratio, { decimalsA: 3, decimalsB: 1 }).toString()).toBe('2');
  });
});
describe('ratios from route', () => {
  it('gets the ratio from a route with one pair', () => {
    expect(
      ratioFromRoute(
        [
          {
            token0: 'ct_1',
            liquidityInfo: {
              reserve0: 1000n,
              reserve1: 2000n,
            },
          },
        ],
        'ct_1',
      ).toString(),
    ).toBe('2');
  });
  it('gets the ratio from a route with no pair', () => {
    expect(ratioFromRoute([], 'ct_1').toString()).toBe('1');
  });
  it('gets the ratio from a route with two pairs #1', () => {
    expect(
      ratioFromRoute(
        [
          {
            token0: 'ct_1',
            token1: 'ct_2',
            liquidityInfo: {
              reserve0: 1n,
              reserve1: 2n,
            },
          },
          {
            token0: 'ct_2',
            token1: 'ct_3',
            liquidityInfo: {
              reserve0: 4n,
              reserve1: 8n,
            },
          },
        ],
        'ct_1',
      ).toString(),
    ).toBe('4');
  });
  it('gets the ratio from a route with two pairs #2', () => {
    expect(
      ratioFromRoute(
        [
          {
            token0: 'ct_2',
            token1: 'ct_1',
            liquidityInfo: {
              reserve0: 2n,
              reserve1: 1n,
            },
          },
          {
            token0: 'ct_2',
            token1: 'ct_3',
            liquidityInfo: {
              reserve0: 4n,
              reserve1: 8n,
            },
          },
        ],
        'ct_1',
      ).toString(),
    ).toBe('4');
  });
  it('gets the ratio from a route with two pairs #3', () => {
    expect(
      ratioFromRoute(
        [
          {
            token0: 'ct_2',
            token1: 'ct_1',
            liquidityInfo: {
              reserve0: 2n,
              reserve1: 1n,
            },
          },
          {
            token0: 'ct_3',
            token1: 'ct_2',
            liquidityInfo: {
              reserve0: 8n,
              reserve1: 4n,
            },
          },
        ],
        'ct_1',
      ).toString(),
    ).toBe('4');
  });
  it('gets the ratio from a route with two pairs #4', () => {
    expect(
      ratioFromRoute(
        [
          {
            token0: 'ct_1',
            token1: 'ct_2',
            liquidityInfo: {
              reserve0: 8n,
              reserve1: 4n,
            },
          },
          {
            token0: 'ct_2',
            token1: 'ct_3',
            liquidityInfo: {
              reserve0: 2n,
              reserve1: 1n,
            },
          },
        ],
        'ct_1',
      ).toString(),
    ).toBe('0.25');
  });
  it('gets the ratio from a route with two pairs #5', () => {
    expect(
      ratioFromRoute(
        [
          {
            token0: 'ct_1',
            token1: 'ct_2',
            liquidityInfo: {
              reserve0: 1n,
              reserve1: 2n,
            },
          },
          {
            token0: 'ct_3',
            token1: 'ct_2',
            liquidityInfo: {
              reserve0: 4n,
              reserve1: 8n,
            },
          },
        ],
        'ct_1',
      ).toString(),
    ).toBe('1');
  });
  it('gets the ratio from a route with two pairs reducing the decimals #1', () => {
    const ratio = ratioFromRoute(
      [
        {
          token0: 'ct_1',
          token1: 'ct_2',
          liquidityInfo: {
            reserve0: 10n,
            reserve1: 200n,
          },
        },
        {
          token0: 'ct_2',
          token1: 'ct_3',
          liquidityInfo: {
            reserve0: 400n,
            reserve1: 8000n,
          },
        },
      ],
      'ct_1',
    );
    expect(ratioWithDecimals(ratio, { decimalsA: 1, decimalsB: 3 }).toString()).toBe('4');
  });
  it('gets the ratio from a route with two pairs reducing the decimals #2', () => {
    const ratio = ratioFromRoute(
      [
        {
          token0: 'ct_1',
          token1: 'ct_2',
          liquidityInfo: {
            reserve0: 1000n,
            reserve1: 200n,
          },
        },
        {
          token0: 'ct_2',
          token1: 'ct_3',
          liquidityInfo: {
            reserve0: 400n,
            reserve1: 80n,
          },
        },
      ],
      'ct_1',
    );
    expect(ratioWithDecimals(ratio, { decimalsA: 3, decimalsB: 1 }).toString()).toBe('4');
  });
  it('gets the ratio from a route with two pairs reducing the decimals #3', () => {
    const ratio = ratioFromRoute(
      [
        {
          token0: 'ct_1',
          token1: 'ct_2',
          liquidityInfo: {
            reserve0: 1000n,
            reserve1: 200n,
          },
        },
        {
          token0: 'ct_2',
          token1: 'ct_3',
          liquidityInfo: {
            reserve0: 400n,
            reserve1: 8000n,
          },
        },
      ],
      'ct_1',
    );
    expect(ratioWithDecimals(ratio, { decimalsA: 3, decimalsB: 3 }).toString()).toBe('4');
  });
  it('gets the ratio from a route with 4 pairs reducing the decimals', () => {
    const ratio = ratioFromRoute(
      [
        {
          token0: 'ct_1',
          token1: 'ct_2',
          liquidityInfo: {
            reserve0: 10n,
            reserve1: 200n,
          },
        },
        {
          token0: 'ct_2',
          token1: 'ct_3',
          liquidityInfo: {
            reserve0: 200n,
            reserve1: 400n,
          },
        },
        {
          token0: 'ct_4',
          token1: 'ct_3',
          liquidityInfo: {
            reserve0: 800n,
            reserve1: 400n,
          },
        },
        {
          token0: 'ct_4',
          token1: 'ct_5',
          liquidityInfo: {
            reserve0: 1600n,
            reserve1: 3200n,
          },
        },
      ],
      'ct_1',
    );
    expect(ratioWithDecimals(ratio, { decimalsA: 1, decimalsB: 2 }).toString()).toBe('16');
  });
});
