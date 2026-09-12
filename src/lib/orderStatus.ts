/**
 * Terminal order statuses — an order stays visible on the driver's dashboard
 * until its status is officially marked terminal (completed/cancelled).
 * Matches the backend's canonical uppercase statuses, case-insensitively.
 */
const TERMINAL_STATUS_SET = new Set(['COMPLETED', 'DELIVERED', 'CANCELLED', 'REJECTED']);

export const isTerminalStatus = (status?: string): boolean =>
  TERMINAL_STATUS_SET.has((status || '').toUpperCase());
