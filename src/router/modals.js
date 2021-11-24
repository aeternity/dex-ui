import { registerModal } from '../store/plugins/modals';
import TooltipModal from '../components/TooltipModal.vue';

export default () => {
  registerModal({ name: 'show-tooltip', component: TooltipModal });
};
