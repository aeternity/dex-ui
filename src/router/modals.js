import AccountInfoModal from '@/components/AccountInfoModal.vue';
import SelectTokenModal from '@/components/TokenSelector/SelectTokenModal.vue';
import ErrorModal from '@/components/ErrorModal.vue';
import TooltipModal from '@/components/TooltipModal.vue';
import ConfirmSwapModal from '@/components/ConfirmSwapModal.vue';
import ConfirmLiquidityModal from '@/components/ConfirmLiquidityModal.vue';
import AboutModal from '@/components/AboutModal.vue';
import SubmitTransactionModal from '@/components/SubmitTransactionModal.vue';
import ConnectWalletModal from '@/components/ConnectWalletModal.vue';
import NotificationTransactionStatus from '@/components/NotificationTransactionStatus.vue';
import NotificationConnectionStatus from '@/components/NotificationConnectionStatus.vue';
import TermAndConditionModal from '@/components/TermAndConditionModal.vue';
import OnboardingModal from '@/components/OnboardingModal.vue';
import { registerModal } from '../store/plugins/modals';

export default () => {
  registerModal({ name: 'show-tooltip', component: TooltipModal });
  registerModal({ name: 'select-token', component: SelectTokenModal });
  registerModal({ name: 'confirm-swap', component: ConfirmSwapModal });
  registerModal({ name: 'confirm-liquidity', component: ConfirmLiquidityModal });
  registerModal({ name: 'about-dex', component: AboutModal });
  registerModal({ name: 'submit-transaction', component: SubmitTransactionModal });
  registerModal({ name: 'show-error', component: ErrorModal });
  registerModal({ name: 'connect-wallet', component: ConnectWalletModal });
  registerModal({ name: 'account-info', component: AccountInfoModal });
  registerModal({
    name: 'transaction-status',
    component: NotificationTransactionStatus,
    allowRedirect: true,
  });
  registerModal({
    name: 'connection-status',
    component: NotificationConnectionStatus,
    allowRedirect: true,
  });
  registerModal({ name: 'term-and-condition', component: TermAndConditionModal });
  registerModal({ name: 'onboarding', component: OnboardingModal });
};
