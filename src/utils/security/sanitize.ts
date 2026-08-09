export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizeSearchQuery(query: string): string {
  return query.replace(/[<>]/g, '').trim().slice(0, 100);
}

export function sanitizeNumberInput(value: string): string {
  return value.replace(/[^0-9.]/g, '');
}

export function sanitizeOrderId(orderId: string): string {
  return orderId.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
}
