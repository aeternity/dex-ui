const lowSlippageMessage = 'The provided slippage is too low for this trade. You can either increase the slippage or reduce the trade volume.';

const dexUiErrorMessages = {
  'AedexV2Library: INSUFFICIENT_OUTPUT_AMOUNT': lowSlippageMessage,
  'AedexV2Router: INSUFFICIENT_OUTPUT_AMOUNT': lowSlippageMessage,
  'AedexV2Pair: INSUFFICIENT_OUTPUT_AMOUNT': lowSlippageMessage,
  'AedexV2Library: INSUFFICIENT_INPUT_AMOUNT': lowSlippageMessage,
  'AedexV2Pair: INSUFFICIENT_INPUT_AMOUNT': lowSlippageMessage,
  'AedexV2Router: EXCESSIVE_INPUT_AMOUNT': lowSlippageMessage,
};

export default dexUiErrorMessages;
