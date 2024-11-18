import BigNumber from 'bignumber.js';

/**
 * A number, or a string containing a number.
 * @typedef {(BigNumber|number|bigint|string)} NumberLike
 * @typedef {[ NumberLike, NumberLike ]} Reserves
 */

/**
 * @description orders the route in the proper direction depending on the starting token
 * NOTE: is useful for swaps
 */
const orderRoute = (route, tokenA) => {
  if (!route || !route.length) return [];
  return route.length < 2 || route[0].token0 === tokenA || route[0].token1 === tokenA
    ? route
    : [...route].reverse();
};

/**
 * @description extracts the pair reserves from a swap-route
 * @param {array} route - the route in the shape received from 'dex-backend'
 * @param {string} tokenA tokenA address
 * @return {Reserves[]}
 * NOTE: doesn't matter if the route starts with tokenA or with tokenB.
 * the function is capable to figure out the right order
 */
export const getRouteReserves = (route, tokenA) => {
  if (!route || !route.length) return [];
  return orderRoute(route, tokenA).reduce(
    ([acc, prev], { token0, token1, liquidityInfo: { reserve0, reserve1 } }) => {
      const [reserves, next] =
        token0 === prev ? [[reserve0, reserve1], token1] : [[reserve1, reserve0], token0];
      return [acc.concat([reserves]), next];
    },
    [[], tokenA],
  )[0];
};
/**
 * @description gets ratio from a full swap-route path
 * @param {array} route path
 * @param {string} tokenA address
 * @return {BigNumber}
 */
const ratioFromPairReserves = (pairReserves) =>
  pairReserves.reduce(
    (ratio, [reserveA, reserveB]) => ratio.multipliedBy(BigNumber(reserveB).div(reserveA)),
    BigNumber(1),
  );

/**
 * @description gets ratio from a full swap-route path
 * @param {array} route path
 * @param {string} tokenA address
 * @return {BigNumber}
 */
export const ratioFromRoute = (route, tokenA) =>
  ratioFromPairReserves(getRouteReserves(route, tokenA));

/**
 * @description reduce the decimals from a token pair ratio
 * @param {string|BigNumber|bigint} ratio
 * @param {decimalsA,decimalsB} decimals for tokenA and tokenB
 * @return {BigNumber}
 */
export const ratioWithDecimals = (ratio, { decimalsA, decimalsB }) =>
  BigNumber(ratio).shiftedBy(decimalsA - decimalsB);

/**
 * @description extracts the token path from a swap-route
 * @param {array} route the route in the shape received from 'dex-backend'
 * @param {string} tokenA tokenA address
 * @return {string[]}
 * NOTE: doesn't matter if the route starts with tokenA or with tokenB.
 * the function is capable to figure out the right order
 */
export const getPath = (route, tokenA) => {
  if (!route?.length) return [];
  const ordered = orderRoute(route, tokenA);
  const [first, last] = ordered.reduce(
    ([acc, prev], pair) => {
      const next = pair.token0 === prev ? pair.token1 : pair.token0;
      return [acc.concat(prev), next];
    },
    [[], tokenA],
  );
  return first.concat(last);
};

/**
 * @description for a given pair it gets the number of tokensB received after the swap
 * @param {NumberLike} reserveA number of tokensA in the pair
 * @param {NumberLike} reserveB number of tokensB in the pair
 * @param {NumberLike} amountA number of tokensA given for the swap
 * @return {BigNumber} number of tokens received after the swap
 */
const getReceivedTokensForOnePair = (reserveA, reserveB, amountA) => {
  const k = BigNumber(reserveA).times(reserveB);
  const newReserveA = BigNumber(reserveA).plus(amountA);
  const newReserveB = k.div(newReserveA);
  return BigNumber(reserveB).minus(newReserveB);
};

/**
 * @description for a given pairReserves it gets the number of tokensB received after the swap
 * @param {Reserves[]} pairReserves - the route for swapping
 * @param {NumberLike} amountA - number of tokensA to be swapped
 * @return {BigNumber} number of tokens received after the swap
 */
export const getReceivedTokensForPairReserves = (pairReserves, amountA) =>
  pairReserves.reduce(
    (amountFrom, [reserveFrom, reserveTo]) =>
      getReceivedTokensForOnePair(reserveFrom, reserveTo, amountFrom),
    amountA,
  );

const getPriceImpactForPairReserves = (pairReserves, amountA) => {
  const receivedB = getReceivedTokensForPairReserves(pairReserves, amountA);
  const marketPrice = BigNumber(1).div(ratioFromPairReserves(pairReserves));
  const newPrice = BigNumber(amountA).div(receivedB);

  return -newPrice.minus(marketPrice).times(100).div(newPrice).toNumber();
};

/**
 * @description for a given swap-route it gets the priceImpact
 * @param {array} route the route in the shape received from 'dex-backend'
 * @param {string} tokenA tokenA address
 * @return {BigNumber} the price impact affected by the swap
 */
export const getPriceImpactForRoute = (route, tokenA, amountA) => {
  const pairReserves = getRouteReserves(route, tokenA);
  return getPriceImpactForPairReserves(pairReserves, amountA);
};

/**
 * @description for a given swap-route it gets the number of tokensB received after the swap
 * @param {array} route the route in the shape received from 'dex-backend'
 * @param {string} tokenA tokenA address
 * @return {BigNumber} number of tokens received after the swap
 */
export const getReceivedTokensForRoute = (route, tokenA, amountA) => {
  const pairReserves = getRouteReserves(route, tokenA);
  return getReceivedTokensForPairReserves(pairReserves, amountA);
};
