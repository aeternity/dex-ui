import {
  ratioFromRoute, ratioWithDecimals, ratioFromPair, getPath,
} from '../../src/lib/routeUtils';

describe('get path tests', () => {
  const A = 'a';
  const B = 'b';
  const C = 'c';
  const path = (route, tokenA) => getPath(
    route.map((x) => ({
      ...x,
      token0: x.t0,
      token1: x.t1,
    })), tokenA,
  );
  it('gets nothing from empty route', () => {
    expect(getPath([], 'ct_1')).toEqual([]);
  });
  const testPath = (input, token, result) => it(
    `gets ${JSON.stringify(result)} from route ${JSON.stringify(input)}`,
    () => {
      expect(path(input, token)).toEqual(result);
    },
  );
  testPath([{ t0: A, t1: B }], A, [A, B]);
  testPath([{ t0: B, t1: A }], A, [A, B]);
  testPath([{ t0: A, t1: B }, { t0: B, t1: C }], A, [A, B, C]);
  testPath([{ t0: B, t1: C }, { t0: A, t1: B }], A, [A, B, C]);

  describe('test longer paths', () => {
    const range = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const input = range.slice(1).reduce(([acc, prev], x) => [
      acc.concat({ t0: prev, t1: x }),
      x,
    ], [[], range[0]])[0];
    testPath(input, range[0], range);
    testPath([...input].reverse(), range[0], range);
    testPath(input, range[range.length - 1], [...range].reverse());
    testPath([...input].reverse(), range[range.length - 1], [...range].reverse());
  });
});
describe('ratio from one pair', () => {
  it('simple 1/1 pair', () => {
    expect(
      ratioFromPair({
        token0: 'ct_1',
        liquidityInfo: {
          reserve0: 1n,
          reserve1: 1n,
        },
      }, 'ct_1').toString(),
    ).toBe('1');
  });
  it('gets ratio in form of reserve1/reserve0', () => {
    expect(
      ratioFromPair({
        token0: 'ct_1',
        liquidityInfo: {
          reserve0: 1000n,
          reserve1: 2000n,
        },
      }, 'ct_1').toString(),
    ).toBe('2');
  });
  it('gets ratio in form of reserve1/reserve0', () => {
    expect(
      ratioFromPair({
        token0: 'ct_2',
        liquidityInfo: {
          reserve0: 1000n,
          reserve1: 2000n,
        },
      }, 'ct_1').toString(),
    ).toBe('0.5');
  });
});
describe('ratio with decimals', () => {
  it('get ratio with decimals when tokenA decimals ar less', () => {
    const ratio = ratioFromPair({
      token0: 'ct_1',
      liquidityInfo: {
        reserve0: 10n,
        reserve1: 4000n,
      },
    }, 'ct_1');
    expect(
      ratioWithDecimals(ratio, { decimalsA: 1, decimalsB: 3 }).toString(),
    ).toBe('4');
  });
  it('get ratio with decimals when tokenA decimals ar greater', () => {
    const ratio = ratioFromPair({
      token0: 'ct_1',
      liquidityInfo: {
        reserve0: 200n,
        reserve1: 4n,
      },
    }, 'ct_1');
    expect(
      ratioWithDecimals(ratio, { decimalsA: 3, decimalsB: 1 }).toString(),
    ).toBe('2');
  });
});
describe('ratios from route', () => {
  it('gets the ratio from a route with one pair', () => {
    expect(
      ratioFromRoute([{
        token0: 'ct_1',
        liquidityInfo: {
          reserve0: 1000n,
          reserve1: 2000n,
        },
      }], 'ct_1').toString(),
    ).toBe('2');
  });
  it('gets the ratio from a route with no pair', () => {
    expect(
      ratioFromRoute([], 'ct_1').toString(),
    ).toBe('1');
  });
  it('gets the ratio from a route with two pairs #1', () => {
    expect(
      ratioFromRoute([{
        token0: 'ct_1',
        token1: 'ct_2',
        liquidityInfo: {
          reserve0: 1n,
          reserve1: 2n,
        },
      }, {
        token0: 'ct_2',
        token1: 'ct_3',
        liquidityInfo: {
          reserve0: 4n,
          reserve1: 8n,
        },
      }], 'ct_1').toString(),
    ).toBe('4');
  });
  it('gets the ratio from a route with two pairs #2', () => {
    expect(
      ratioFromRoute([{
        token0: 'ct_2',
        token1: 'ct_1',
        liquidityInfo: {
          reserve0: 2n,
          reserve1: 1n,
        },
      }, {
        token0: 'ct_2',
        token1: 'ct_3',
        liquidityInfo: {
          reserve0: 4n,
          reserve1: 8n,
        },
      }], 'ct_1').toString(),
    ).toBe('4');
  });
  it('gets the ratio from a route with two pairs #3', () => {
    expect(
      ratioFromRoute([{
        token0: 'ct_2',
        token1: 'ct_1',
        liquidityInfo: {
          reserve0: 2n,
          reserve1: 1n,
        },
      }, {
        token0: 'ct_3',
        token1: 'ct_2',
        liquidityInfo: {
          reserve0: 8n,
          reserve1: 4n,
        },
      }], 'ct_1').toString(),
    ).toBe('4');
  });
  it('gets the ratio from a route with two pairs #4', () => {
    expect(
      ratioFromRoute([{
        token0: 'ct_1',
        token1: 'ct_2',
        liquidityInfo: {
          reserve0: 8n,
          reserve1: 4n,
        },
      }, {
        token0: 'ct_2',
        token1: 'ct_3',
        liquidityInfo: {
          reserve0: 2n,
          reserve1: 1n,
        },
      }], 'ct_1').toString(),
    ).toBe('0.25');
  });
  it('gets the ratio from a route with two pairs #5', () => {
    expect(
      ratioFromRoute([{
        token0: 'ct_1',
        token1: 'ct_2',
        liquidityInfo: {
          reserve0: 1n,
          reserve1: 2n,
        },
      }, {
        token0: 'ct_3',
        token1: 'ct_2',
        liquidityInfo: {
          reserve0: 4n,
          reserve1: 8n,
        },
      }], 'ct_1').toString(),
    ).toBe('1');
  });
  it('gets the ratio from a route with two pairs reducing the decimals #1', () => {
    const ratio = ratioFromRoute([{
      token0: 'ct_1',
      token1: 'ct_2',
      liquidityInfo: {
        reserve0: 10n,
        reserve1: 200n,
      },
    }, {
      token0: 'ct_2',
      token1: 'ct_3',
      liquidityInfo: {
        reserve0: 400n,
        reserve1: 8000n,
      },
    }], 'ct_1');
    expect(
      ratioWithDecimals(ratio, { decimalsA: 1, decimalsB: 3 }).toString(),
    ).toBe('4');
  });
  it('gets the ratio from a route with two pairs reducing the decimals #2', () => {
    const ratio = ratioFromRoute([{
      token0: 'ct_1',
      token1: 'ct_2',
      liquidityInfo: {
        reserve0: 1000n,
        reserve1: 200n,
      },
    }, {
      token0: 'ct_2',
      token1: 'ct_3',
      liquidityInfo: {
        reserve0: 400n,
        reserve1: 80n,
      },
    }], 'ct_1');
    expect(
      ratioWithDecimals(ratio, { decimalsA: 3, decimalsB: 1 }).toString(),
    ).toBe('4');
  });
  it('gets the ratio from a route with two pairs reducing the decimals #3', () => {
    const ratio = ratioFromRoute([{
      token0: 'ct_1',
      token1: 'ct_2',
      liquidityInfo: {
        reserve0: 1000n,
        reserve1: 200n,
      },
    }, {
      token0: 'ct_2',
      token1: 'ct_3',
      liquidityInfo: {
        reserve0: 400n,
        reserve1: 8000n,
      },
    }], 'ct_1');
    expect(
      ratioWithDecimals(ratio, { decimalsA: 3, decimalsB: 3 }).toString(),
    ).toBe('4');
  });
  it('gets the ratio from a route with 4 pairs reducing the decimals', () => {
    const ratio = ratioFromRoute([{
      token0: 'ct_1',
      token1: 'ct_2',
      liquidityInfo: {
        reserve0: 10n,
        reserve1: 200n,
      },
    }, {
      token0: 'ct_2',
      token1: 'ct_3',
      liquidityInfo: {
        reserve0: 200n,
        reserve1: 400n,
      },
    }, {
      token0: 'ct_4',
      token1: 'ct_3',
      liquidityInfo: {
        reserve0: 800n,
        reserve1: 400n,
      },
    }, {
      token0: 'ct_4',
      token1: 'ct_5',
      liquidityInfo: {
        reserve0: 1600n,
        reserve1: 3200n,
      },
    }], 'ct_1');
    expect(
      ratioWithDecimals(ratio, { decimalsA: 1, decimalsB: 2 }).toString(),
    ).toBe('16');
  });
});
