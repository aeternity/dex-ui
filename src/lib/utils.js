import { AmountFormatter } from '@aeternity/aepp-sdk';
import BigNumber from 'bignumber.js';
import dexErrorMessages from 'dex-contracts-v2/build/errors';

export const fetchJson = async (...args) => {
  const response = await fetch(...args);
  return response.json();
};

export const aettosToAe = (v) => AmountFormatter.formatAmount(v, {
  denomination: AmountFormatter.AE_AMOUNT_FORMATS.AETTOS,
  targetDenomination: AmountFormatter.AE_AMOUNT_FORMATS.AE,
});

export const cttoak = (value) => value.replace('ct_', 'ak_');
export const calculateSelectedToken = (token, from, to, isFrom) => {
  const result = [from, to, false];
  const getKey = (t) => t?.contract_id + (!!t?.is_ae);
  if (!token
    || (getKey(token) === getKey(from) && !isFrom)
    || (getKey(token) === getKey(to) && isFrom)) {
    result[1] = from;
    result[0] = to;
    result[2] = true;
    return result;
  }
  if (isFrom) {
    result[0] = token;
  } else {
    result[1] = token;
  }
  return result;
};

export const reduceDecimals = (val, decimals) => BigNumber(val).shiftedBy(-decimals);
export const expandDecimals = (val, decimals) => BigInt(
  BigNumber(val).shiftedBy(decimals).toFixed(0),
);

export const handleUnknownError = (error) => console.warn('Unknown rejection', error);

export const findErrorExplanation = (message, { networkId } = {}) => {
  if (!message) {
    return message;
  }
  if (message === 'Unsupported Network') {
    return `Network ${networkId} is not supported, please switch to Testnet`;
  }

  const found = message.replace('Invocation failed: "', '').split('"')[0];

  const errorExplanation = dexErrorMessages[found];
  return errorExplanation || message;
};

export const isNotFoundError = (error) => error.statusCode === 404;

export const createDeepLinkUrl = ({ type, callbackUrl, ...params }) => {
  const url = new URL(`${process.env.VUE_APP_WALLET_URL}/${type}`);
  if (callbackUrl) {
    url.searchParams.set('x-success', callbackUrl);
    url.searchParams.set('x-cancel', callbackUrl);
  }
  Object.entries(params)
    .filter(([, value]) => ![undefined, null].includes(value))
    .forEach(([name, value]) => url.searchParams.set(name, value));
  return url;
};

export const createOnAccountObject = (address) => ({
  address: () => address,
  sign: () => {
    throw new Error('Private key is not available');
  },
});

export const getAePair = (from, to, amountFrom, amountTo) => {
  if (from && to) {
    if (from.is_ae) {
      return {
        isTokenFrom: false,
        token: to,
        tokenAmount: amountTo,
        wae: from,
        aeAmount: amountFrom,
      };
    }
    if (to.is_ae) {
      return {
        isTokenFrom: true,
        token: from,
        tokenAmount: amountFrom,
        wae: to,
        aeAmount: amountTo,
      };
    }
  }
  return null;
};

/**
 * adds slippage to a given value
 * @async
 * @param {bigint} value given value
 * @param {bigint} slippage percentage (eg. 10,20...100)
 * @return biging representing final value
*/
export const addSlippage = (value, slippage) => value + (value * BigInt(slippage * 10)) / 1000n;

/**
 * subtracts slippage from a given value
 * @async
 * @param {bigint} value given value
 * @param {bigint} slippage percentage (eg. 10,20...100)
 * @return biging representing final value
*/
export const subSlippage = (value, slippage) => value - (value * BigInt(slippage * 10)) / 1000n;

/**
 * Resolve promise with timeout
 * @param {number} timeout
 * @param {fn} callback
 * @returns Promise
 */
export const resolveWithTimeout = (timeout, callback) => Promise.race([
  callback(),
  new Promise((resolve, reject) => setTimeout(() => {
    reject(new Error(`Promise TIMEOUT after ${timeout} ms`));
  }, timeout)),
]);

/**
 * Detect if Safari browser
 * @returns boolean
 */
export const isSafariBrowser = () => navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');

/**
 * Sort two tokens in ascending order
 * @param {any} tokenA
 * @param {any} tokenB
 * @param {fn | null} transform a function applied to both inputs before comparing.
 * if `transform` is not provided the inputs value will be compared
 * @returns [token0,token1]
 */
export const sortTokens = (tokenA, tokenB, transform) => {
  const f = transform || ((x) => x);
  return (f(tokenA) < f(tokenB)) ? [tokenA, tokenB] : [tokenB, tokenA];
};

/**
 * Gets a pair unique string based on tokenA and tokenB.
 * @param {string} tokenA
 * @param {string} tokenB
 * @returns string
 */
export const getPairId = (tokenA, tokenB) => {
  const [token0, token1] = sortTokens(tokenA, tokenB);
  return `${token0}|${token1}`;
};
