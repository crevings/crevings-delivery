import { Order } from '../types';

export const printKOT = (order: Order) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const content = `
    <html>
      <head>
        <title>KOT - ${order.id}</title>
        <style>
          body { font-family: monospace; padding: 20px; width: 300px; }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; }
          .footer { border-top: 1px dashed #000; margin-top: 10px; padding-top: 10px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>KITCHEN ORDER TICKET</h2>
          <p>Order ID: ${order.id}</p>
          <p>Time: ${new Date().toLocaleTimeString()}</p>
          <p>Type: ${order.type}</p>
        </div>
        <div class="items">
          ${order.itemList?.map(item => `
            <div class="item">
              <span>${item.quantity}x ${item.name}</span>
            </div>
          `).join('') || order.items}
        </div>
        <div class="footer">
          <p>Crevings Delivery Partner</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.print();
};

export const printInvoice = (order: Order) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const content = `
    <html>
      <head>
        <title>Invoice - ${order.id}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; width: 350px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .details { margin: 10px 0; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; }
          .total { border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>CREVINGS INVOICE</h2>
          <p>Order #${order.id}</p>
        </div>
        <div class="details">
          <p>Customer: ${order.customer}</p>
          <p>Status: ${order.paymentStatus || 'Paid'}</p>
        </div>
        <div class="items">
          ${order.itemList?.map(item => `
            <div class="item">
              <span>${item.quantity}x ${item.name}</span>
            </div>
          `).join('') || order.items}
        </div>
        <div class="total">
          <div class="item">
            <span>Total:</span>
            <span>₹${order.total}</span>
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.print();
};
