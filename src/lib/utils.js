export const fetchJson = async (...args) => {
  const response = await fetch(...args);
  return response.json();
};

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
