import { registerModal } from '../store/plugins/modals';
import SelectTokenModal from '../components/SelectTokenModal.vue';
import ErrorModal from '../components/ErrorModal.vue';
import TooltipModal from '../components/TooltipModal.vue';
import ConfirmSwapModal from '../components/ConfirmSwapModal.vue';
import ConfirmAddModal from '../components/ConfirmAddModal.vue';
import SubmitTransactionModal from '../components/SubmitTransactionModal.vue';

export default () => {
  registerModal({ name: 'show-tooltip', component: TooltipModal });
  registerModal({ name: 'select-token', component: SelectTokenModal });
  registerModal({ name: 'confirm-swap', component: ConfirmSwapModal });
  registerModal({ name: 'confirm-add', component: ConfirmAddModal });
  registerModal({ name: 'submit-transaction', component: SubmitTransactionModal });
  registerModal({ name: 'show-error', component: ErrorModal });
};
