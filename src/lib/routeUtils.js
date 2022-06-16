import BigNumber from 'bignumber.js';

const inferReserve = ({
  token0,
  liquidityInfo: { reserve0, reserve1 },
}, tokenA) => (token0 === tokenA ? [reserve0, reserve1] : [reserve1, reserve0]);

/**
 * @description get tokenA ratio from a pairInfo provided by dex-backend
 * at pair/swap-routes
 * @param {object} pair information
 * @param {string} tokenA address
 * @return {bignumber}
*/
export const ratioFromPair = (pair, tokenA) => {
  const [reserveA, reserveB] = inferReserve(pair, tokenA);
  // we don't take decimals in consideration
  // because we don't know the intermediate token's decimals
  return BigNumber(reserveB).div(reserveA);
};

/**
 * @description get ratio from a full swap-route path
 * @param {array} route path
 * @param {string} tokenA address
 * @return {bignumber}
*/
export const ratioFromRoute = (route, tokenA) => route.reduce(([ratio, token], pair) => {
  const oppositeToken = pair.token0 === token ? pair.token1 : pair.token0;
  return [ratio.multipliedBy(ratioFromPair(pair, token)), oppositeToken];
},
[BigNumber(1), tokenA])[0];

/**
 * @description reduce the decimals from a token pair ratio
 * @param {string|BigNumber|bigint} ratio
 * @param {decimalsA,decimalsB} decimals for tokenA and tokenB
 * @return {bignumber}
*/
export const ratioWithDecimals = (
  ratio,
  { decimalsA, decimalsB },
) => BigNumber(ratio).shiftedBy(decimalsA - decimalsB);
