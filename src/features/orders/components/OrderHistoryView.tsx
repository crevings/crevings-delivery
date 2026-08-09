import { OrderHistoryView as OrderHistoryViewBase } from '@/components/OrderHistoryView';
import { useNavigate } from 'react-router-dom';

export function OrderHistoryView() {
  const navigate = useNavigate();

  return <OrderHistoryViewBase onBack={() => navigate(-1)} />;
}

export default OrderHistoryView;
