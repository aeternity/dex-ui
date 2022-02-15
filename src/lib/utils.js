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

export const findErrorExplanation = (message) => {
  if (!message) {
    return message;
  }
  const found = message.replace('Invocation failed: "', '').split('"')[0];

  const errorExplanation = dexErrorMessages[found];
  return errorExplanation || message;
};

export const isNotFoundError = (error) => error.statusCode === 404;

// TODO: in the end this should must be replaced by
// the tokenlis from the backend
//
export const getTokenList = () => [
  {
    contract_id: 'ct_6QW59xdMKbZpRCF5f6gD4aAqYM54f5E1FfB5mpvg6isridEZ6',
    decimals: 18,
    name: 'First',
    symbol: 'FST',
  },
  {
    contract_id: 'ct_2FgBrHgVG8rbSwN78KZHPK7kekxRopSeUcZwVVmqinBftvoaQg',
    decimals: 18,
    name: 'Second',
    symbol: 'SND',
  },
  {
    contract_id: 'ct_eWW5hrHvyVcsCAVmoZRPeeCbsqKXFpVH81qVmUkaAju8H2esi',
    decimals: 18,
    name: 'Third',
    symbol: 'AE Partner',
  },
  {
    contract_id: process.env.VUE_APP_WAE_ADDRESS,
    decimals: 18,
    name: 'AE',
    symbol: 'AE',
    is_ae: true,
  },
  {
    contract_id: process.env.VUE_APP_WAE_ADDRESS,
    decimals: 18,
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
