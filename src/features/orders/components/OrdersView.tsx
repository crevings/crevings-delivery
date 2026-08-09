import { OrdersView as OrdersViewBase } from '@/components/OrdersView';
import { useOrdersStore } from '@/app/store';

export function OrdersView() {
  const orders = useOrdersStore(s => s.orders);

  return (
    <OrdersViewBase
      orders={orders}
      onUpdateOrderStatus={() => {
        // Order status progression is handled inside OrderDetailView via the API.
      }}
    />
  );
}

export default OrdersView;
