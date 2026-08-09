import { Dashboard as DashboardView } from '@/components/Dashboard';
import { useOrdersStore, usePartnerStore } from '@/app/store';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const navigate = useNavigate();
  const orders = useOrdersStore(s => s.orders);
  const addOrder = useOrdersStore(s => s.addOrder);
  const isOnline = usePartnerStore(s => s.isOnline);
  const setIsOnline = usePartnerStore(s => s.setIsOnline);

  return (
    <DashboardView
      orders={orders}
      onAddOrder={addOrder}
      isOnline={isOnline}
      setIsOnline={setIsOnline}
      onNavigateToOrders={() => navigate('/orders')}
    />
  );
}

export default Dashboard;
