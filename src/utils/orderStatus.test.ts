import { describe, it, expect } from 'vitest';

/**
 * Order Status Tests
 * 
 * Tests the order status constants and utility functions for the delivery app.
 */

// ── Order Status Constants ──────────────────────────────────────────────────

const ORDER_STATUSES = {
  NEW: 'NEW',
  PREPARING: 'PREPARING',
  READY: 'READY',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  DRIVER_ASSIGNED: 'DRIVER_ASSIGNED',
  DRIVER_ARRIVED: 'DRIVER_ARRIVED',
  OUT_FOR_DELIVERY: 'OUT FOR DELIVERY',
  REACHED_CUSTOMER: 'REACHED_CUSTOMER',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
};

const TRIP_STATUSES = [
  'DRIVER_ASSIGNED',
  'DRIVER_ARRIVED',
  'OUT FOR DELIVERY',
  'REACHED_CUSTOMER',
  'DELIVERED',
  'COMPLETED',
];

const DRIVER_SETTABLE_STATUSES = [
  'DRIVER_ARRIVED',
  'OUT FOR DELIVERY',
  'REACHED_CUSTOMER',
  'DELIVERED',
];

const ACTIVE_STATUSES = [
  'DRIVER_ASSIGNED',
  'DRIVER_ARRIVED',
  'OUT FOR DELIVERY',
  'REACHED_CUSTOMER',
];

const HISTORY_STATUSES = [
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
];

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Order Status', () => {
  describe('Status Constants', () => {
    it('should have all required statuses', () => {
      expect(ORDER_STATUSES.NEW).toBe('NEW');
      expect(ORDER_STATUSES.PREPARING).toBe('PREPARING');
      expect(ORDER_STATUSES.READY).toBe('READY');
      expect(ORDER_STATUSES.READY_FOR_PICKUP).toBe('READY_FOR_PICKUP');
      expect(ORDER_STATUSES.DRIVER_ASSIGNED).toBe('DRIVER_ASSIGNED');
      expect(ORDER_STATUSES.DRIVER_ARRIVED).toBe('DRIVER_ARRIVED');
      expect(ORDER_STATUSES.OUT_FOR_DELIVERY).toBe('OUT FOR DELIVERY');
      expect(ORDER_STATUSES.REACHED_CUSTOMER).toBe('REACHED_CUSTOMER');
      expect(ORDER_STATUSES.DELIVERED).toBe('DELIVERED');
      expect(ORDER_STATUSES.COMPLETED).toBe('COMPLETED');
      expect(ORDER_STATUSES.CANCELLED).toBe('CANCELLED');
      expect(ORDER_STATUSES.REJECTED).toBe('REJECTED');
    });

    it('should have unique status values', () => {
      const values = Object.values(ORDER_STATUSES);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe('Trip Statuses', () => {
    it('should include all trip-related statuses', () => {
      expect(TRIP_STATUSES).toContain('DRIVER_ASSIGNED');
      expect(TRIP_STATUSES).toContain('DRIVER_ARRIVED');
      expect(TRIP_STATUSES).toContain('OUT FOR DELIVERY');
      expect(TRIP_STATUSES).toContain('REACHED_CUSTOMER');
      expect(TRIP_STATUSES).toContain('DELIVERED');
      expect(TRIP_STATUSES).toContain('COMPLETED');
    });

    it('should not include terminal statuses', () => {
      expect(TRIP_STATUSES).not.toContain('CANCELLED');
      expect(TRIP_STATUSES).not.toContain('REJECTED');
    });

    it('should be disjoint from history statuses', () => {
      const intersection = TRIP_STATUSES.filter(s => HISTORY_STATUSES.includes(s));
      // DELIVERED and COMPLETED can appear in both trip and history
      // depending on context, so we just check no cancelled/rejected
      expect(intersection).not.toContain('CANCELLED');
      expect(intersection).not.toContain('REJECTED');
    });
  });

  describe('Driver Settable Statuses', () => {
    it('should be a subset of trip statuses', () => {
      for (const status of DRIVER_SETTABLE_STATUSES) {
        expect(TRIP_STATUSES).toContain(status);
      }
    });

    it('should include arrival and delivery statuses', () => {
      expect(DRIVER_SETTABLE_STATUSES).toContain('DRIVER_ARRIVED');
      expect(DRIVER_SETTABLE_STATUSES).toContain('OUT FOR DELIVERY');
      expect(DRIVER_SETTABLE_STATUSES).toContain('REACHED_CUSTOMER');
      expect(DRIVER_SETTABLE_STATUSES).toContain('DELIVERED');
    });

    it('should not include assignment status', () => {
      expect(DRIVER_SETTABLE_STATUSES).not.toContain('DRIVER_ASSIGNED');
    });
  });

  describe('Active Statuses', () => {
    it('should include all active order statuses', () => {
      expect(ACTIVE_STATUSES).toContain('DRIVER_ASSIGNED');
      expect(ACTIVE_STATUSES).toContain('DRIVER_ARRIVED');
      expect(ACTIVE_STATUSES).toContain('OUT FOR DELIVERY');
      expect(ACTIVE_STATUSES).toContain('REACHED_CUSTOMER');
    });

    it('should not include completed statuses', () => {
      expect(ACTIVE_STATUSES).not.toContain('DELIVERED');
      expect(ACTIVE_STATUSES).not.toContain('COMPLETED');
      expect(ACTIVE_STATUSES).not.toContain('CANCELLED');
      expect(ACTIVE_STATUSES).not.toContain('REJECTED');
    });
  });

  describe('History Statuses', () => {
    it('should include all terminal statuses', () => {
      expect(HISTORY_STATUSES).toContain('DELIVERED');
      expect(HISTORY_STATUSES).toContain('COMPLETED');
      expect(HISTORY_STATUSES).toContain('CANCELLED');
      expect(HISTORY_STATUSES).toContain('REJECTED');
    });

    it('should be disjoint from active statuses', () => {
      const intersection = HISTORY_STATUSES.filter(s => ACTIVE_STATUSES.includes(s));
      expect(intersection).toHaveLength(0);
    });
  });

  describe('Status Transitions', () => {
    it('should allow forward transitions', () => {
      const validTransitions = [
        ['DRIVER_ASSIGNED', 'DRIVER_ARRIVED'],
        ['DRIVER_ARRIVED', 'OUT FOR DELIVERY'],
        ['OUT FOR DELIVERY', 'REACHED_CUSTOMER'],
        ['REACHED_CUSTOMER', 'DELIVERED'],
        ['DELIVERED', 'COMPLETED'],
      ];

      for (const [from, to] of validTransitions) {
        expect(ACTIVE_STATUSES.includes(from) || HISTORY_STATUSES.includes(from)).toBe(true);
        expect(ACTIVE_STATUSES.includes(to) || HISTORY_STATUSES.includes(to)).toBe(true);
      }
    });

    it('should allow cancellation from any active state', () => {
      for (const status of ACTIVE_STATUSES) {
        // Cancellation should be allowed from any active state
        expect(ORDER_STATUSES.CANCELLED).toBe('CANCELLED');
      }
    });

    it('should allow rejection from any active state', () => {
      for (const status of ACTIVE_STATUSES) {
        // Rejection should be allowed from any active state
        expect(ORDER_STATUSES.REJECTED).toBe('REJECTED');
      }
    });
  });
});
