import { AmountFormatter } from '@aeternity/aepp-sdk';

export const fetchJson = async (...args) => {
  const response = await fetch(...args);
  return response.json();
};

export const aettosToAe = (v) => AmountFormatter.formatAmount(v, {
  denomination: AmountFormatter.AE_AMOUNT_FORMATS.AETTOS,
  targetDenomination: AmountFormatter.AE_AMOUNT_FORMATS.AE,
});

export const calculateSelectedToken = (token, from, to, isFrom) => {
  const result = [from, to, false];
  if (!token
    || (token.contract_id === from?.contract_id && !isFrom)
    || (token.contract_id === to?.contract_id && isFrom)) {
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

export const handleUnknownError = (error) => console.warn('Unknown rejection', error);

export const isNotFoundError = (error) => error.statusCode === 404;
