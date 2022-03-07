import { AmountFormatter } from '@aeternity/aepp-sdk';
import BigNumber from 'bignumber.js';
import dexErrorMessages from 'dex-contracts-v2/build/errors';
import { MAGNITUDE } from './constants';

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

// TODO: in the end this should be replaced by
// a tokenlist fetched from the backend
//
export const getTokenList = () => [
  {
    contract_id: 'ct_NH6qfe8Gu5QdX7fdmdyD5iQ5yHC64FE4ELsMUok4VWDuqBkct',
    decimals: 18,
    name: 'First',
    symbol: 'FST',
  },
  {
    contract_id: 'ct_2Th7msdjUumYbcnjCkSTr7frXssQAcif39o1SzP7KvdaijAhaE',
    decimals: 18,
    name: 'Second',
    symbol: 'SND',
  },
  {
    contract_id: 'ct_FgayKuf3U9sAKJa3dVtbxfRLCXh5nznab6ULDqQxfgfmszjRo',
    decimals: 18,
    name: 'Third',
    symbol: 'AE Partner',
  },
  {
    contract_id: process.env.VUE_APP_WAE_ADDRESS,
    decimals: MAGNITUDE,
    name: 'AE',
    symbol: 'AE',
    is_ae: true,
  },
  {
    contract_id: process.env.VUE_APP_WAE_ADDRESS,
    decimals: MAGNITUDE,
    name: 'WAE',
    symbol: 'WAE',
    is_ae: false,
  },
];
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
