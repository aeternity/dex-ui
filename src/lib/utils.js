import { formatAmount, AE_AMOUNT_FORMATS, decode } from '@aeternity/aepp-sdk';
import BigNumber from 'bignumber.js';
import dexContractsErrorMessages from 'dex-contracts-v2/build/errors';
import dexUiErrorMessages from '@/lib/errors';
import { DEFAULT_NETWORKS } from '@/lib/constants.js';

// eslint-disable-next-line no-extend-native,func-names
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const errorMessages = {
  ...dexContractsErrorMessages,
  ...dexUiErrorMessages,
};

export const fetchJson = async (...args) => {
  const response = await fetch(...args);
  return response.json();
};

export const aettosToAe = (v) =>
  formatAmount(v, {
    denomination: AE_AMOUNT_FORMATS.AETTOS,
    targetDenomination: AE_AMOUNT_FORMATS.AE,
  });

export const cttoak = (value) => value.replace('ct_', 'ak_');
export const calculateSelectedToken = (token, from, to, isFrom) => {
  const result = [from, to, false];
  const getKey = (t) => (t?.contract_id || '') + !!t?.is_ae;
  if ((getKey(token) === getKey(from) && !isFrom) || (getKey(token) === getKey(to) && isFrom)) {
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
export const expandDecimals = (val, decimals) =>
  BigInt(BigNumber(val).shiftedBy(decimals).toFixed(0));

export const handleUnknownError = (error) => console.warn('Unknown rejection', error);

export const findErrorExplanation = (message, { networkId } = {}) => {
  if (!message) {
    return message;
  }
  if (message === 'Unsupported Network') {
    return `Network ${networkId} is not supported, please switch to Testnet`;
  }

  const found = message.replace('Invocation failed: "', '').split('"')[0];

  const errorExplanation = errorMessages[found];
  return errorExplanation || message;
};

export const isNotFoundError = (error) => error.statusCode === 404;

export const createDeepLinkUrl = ({ type, callbackUrl, ...params }) => {
  const url = new URL(`${import.meta.env.VITE_WALLET_URL}/${type}`);
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
  address,
  signTransaction: () => null,
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
export const resolveWithTimeout = (timeout, callback) =>
  Promise.race([
    callback(),
    new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`Promise TIMEOUT after ${timeout} ms`));
      }, timeout);
    }),
  ]);

/**
 * Detect if Safari browser
 * @returns boolean
 */
export const isSafariBrowser = () =>
  navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');

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
  return f(tokenA) < f(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
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

export const handleCallError = ({ returnType, returnValue }, instance) => {
  let message;
  switch (returnType) {
    case 'ok':
      return;
    case 'revert':
      // eslint-disable-next-line no-underscore-dangle
      message = instance._calldata.decodeFateString(returnValue);
      break;
    case 'error':
      message = decode(returnValue).toString();
      break;
    default:
      message = `Unknown returnType: ${returnType}`;
  }
  throw new Error(message);
};

/**
 * Flag showing when the dex-ui is setup to work without dex-backend
 */
export const isDexBackendDisabled =
  import.meta.env.VITE_DISABLE_DEX_BACKEND && JSON.parse(import.meta.env.VITE_DISABLE_DEX_BACKEND);

export const shortenAddress = (address, lengthStart = 6, lengthEnd = 3) =>
  address ? `${address.slice(0, lengthStart)}...${address.slice(-lengthEnd)}` : '';

export const formatAmountPretty = (amount, decimals) => {
  if (amount === null || new BigNumber(amount).isNaN()) return 'N/A';
  const formattedAmount = new BigNumber(amount).div(new BigNumber(10).pow(decimals)).abs();
  return formattedAmount
    .toFixed(Math.max(0, 5 - formattedAmount.toFixed(0).length))
    .replace(/\.0*$/, '') // remove trailing .0
    .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',') // add 000,000 seperator
    .replace(/(\.\d*[1-9])0+$/, '$1'); // move to 0.0001 instead of 0.00010000
};

export const formatUsdPretty = (amount, decimals) => {
  const formattedAmount = formatAmountPretty(amount, decimals);
  return formattedAmount === 'N/A' ? formattedAmount : `$${formattedAmount}`;
};

export const detectAndModifyWAE = (token) => {
  // find the wrapped ae token and modify it on any network
  const waeAddresses = DEFAULT_NETWORKS.map((network) => network.waeAddress);
  if (waeAddresses.includes(token.address)) {
    return { ...token, symbol: 'AE', decimals: 18 };
  }
  return token;
};
