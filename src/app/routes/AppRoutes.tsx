import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { ProtectedRoute } from './ProtectedRoute';
import { LoadingSpinner } from '@/shared/components/layout';
import { ErrorBoundary } from '@/shared/components/layout/ErrorBoundary';

export function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {ROUTES.map(route => (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.requiresAuth ? (
                  <ProtectedRoute>
                    <route.component />
                  </ProtectedRoute>
                ) : (
                  <route.component />
                )
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
