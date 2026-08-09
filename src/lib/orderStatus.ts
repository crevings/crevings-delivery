/**
 * Terminal order statuses — an order stays visible on the driver's dashboard
 * until its status is officially marked terminal (completed/cancelled).
 * Matches the backend's canonical uppercase statuses, case-insensitively.
 */
const TERMINAL_STATUSES = ['COMPLETED', 'DELIVERED', 'CANCELLED', 'REJECTED'];

export const isTerminalStatus = (status?: string): boolean =>
  TERMINAL_STATUSES.includes((status || '').toUpperCase());
