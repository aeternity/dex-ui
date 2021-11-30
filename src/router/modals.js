import { registerModal } from '../store/plugins/modals';
import SelectTokenModal from '../components/SelectTokenModal.vue';
import TooltipModal from '../components/TooltipModal.vue';
import ConfirmSwapModal from '../components/ConfirmSwapModal.vue';

export default () => {
  registerModal({ name: 'show-tooltip', component: TooltipModal });
  registerModal({ name: 'select-token', component: SelectTokenModal });
  registerModal({ name: 'confirm-swap', component: ConfirmSwapModal });
};
