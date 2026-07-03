// ===============================
// COSMETOLOGY ROUTER - SOFT CODING SOLUTION
// Robust Component Loading with Fallback Support
// ===============================

import React, { Suspense, lazy } from 'react';
import { createFallbackComponent, safeComponentImport, COMPONENT_CONFIGS } from '../utils/componentFactory.jsx';

/**
 * Soft-coded component loader with error boundaries.
 * Takes the dynamic import() promise itself (not a path string) so Vite
 * can statically analyze and bundle each import() call at its own call site -
 * a variable path here would never get bundled and 404 in production.
 */
const createLazyComponent = (componentName, importPromiseFactory) => {
  return lazy(async () => {
    try {
      const module = await importPromiseFactory();

      // Validate the module has proper exports
      if (module.default) {
        return { default: module.default };
      } else if (module[componentName]) {
        return { default: module[componentName] };
      } else {
        console.warn(`Component ${componentName} not found in module, creating fallback`);
        const FallbackComponent = createFallbackComponent(
          componentName,
          `${componentName} component is loading...`
        );
        return { default: FallbackComponent };
      }
    } catch (error) {
      console.error(`Failed to load ${componentName}:`, error);
      const FallbackComponent = createFallbackComponent(
        componentName,
        `Unable to load ${componentName}. Please refresh the page.`
      );
      return { default: FallbackComponent };
    }
  });
};

/**
 * Loading component for Suspense fallback
 */
const LoadingFallback = ({ componentName }) => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
    <div className="text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2 text-muted">Loading {componentName}...</p>
    </div>
  </div>
);

/**
 * Error Boundary Component
 */
class ComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = createFallbackComponent(
        this.props.componentName || 'Component',
        `Error loading component. Please try refreshing the page.`
      );
      return <FallbackComponent />;
    }

    return this.props.children;
  }
}

/**
 * Wrapper component with error boundary and suspense
 */
const SafeComponent = ({ component: Component, componentName, ...props }) => (
  <ComponentErrorBoundary componentName={componentName}>
    <Suspense fallback={<LoadingFallback componentName={componentName} />}>
      <Component {...props} />
    </Suspense>
  </ComponentErrorBoundary>
);

// Soft-coded component definitions
export const CosmetologyComponents = {
  // Primary import with multiple fallback strategies
  CosmetologyClients: createLazyComponent('CosmetologyClients', () => import('../components/cosmetology/CosmetologyClientsSimple.jsx')),
  CosmetologyServices: createLazyComponent('CosmetologyServices', () => import('../components/cosmetology/CosmetologyServices.jsx')),
  CosmetologyAppointments: createLazyComponent('CosmetologyAppointments', () => import('../components/cosmetology/CosmetologyAppointments.jsx')),
  CosmetologyTreatments: createLazyComponent('CosmetologyTreatments', () => import('../components/cosmetology/CosmetologyTreatments.jsx')),
  CosmetologyProducts: createLazyComponent('CosmetologyProducts', () => import('../components/cosmetology/CosmetologyProducts.jsx')),
  CosmetologyConsultations: createLazyComponent('CosmetologyConsultations', () => import('../components/cosmetology/CosmetologyConsultations.jsx')),
  CosmetologyDashboard: createLazyComponent('CosmetologyDashboard', () => import('../components/cosmetology/CosmetologyDashboard.jsx')),
};

/**
 * Route configuration with soft-coded paths
 */
export const cosmetologyRoutes = [
  {
    path: '/cosmetology/clients',
    component: CosmetologyComponents.CosmetologyClients,
    name: 'CosmetologyClients',
    title: 'Clients Management'
  },
  {
    path: '/cosmetology/services',
    component: CosmetologyComponents.CosmetologyServices,
    name: 'CosmetologyServices',
    title: 'Services Management'
  },
  {
    path: '/cosmetology/appointments',
    component: CosmetologyComponents.CosmetologyAppointments,
    name: 'CosmetologyAppointments',
    title: 'Appointments Management'
  },
  {
    path: '/cosmetology/treatments',
    component: CosmetologyComponents.CosmetologyTreatments,
    name: 'CosmetologyTreatments',
    title: 'Treatments Management'
  },
  {
    path: '/cosmetology/products',
    component: CosmetologyComponents.CosmetologyProducts,
    name: 'CosmetologyProducts',
    title: 'Products Management'
  },
  {
    path: '/cosmetology/consultations',
    component: CosmetologyComponents.CosmetologyConsultations,
    name: 'CosmetologyConsultations',
    title: 'Consultations Management'
  },
  {
    path: '/cosmetology',
    component: CosmetologyComponents.CosmetologyDashboard,
    name: 'CosmetologyDashboard',
    title: 'Cosmetology Dashboard'
  }
];

export { SafeComponent, ComponentErrorBoundary, LoadingFallback };
export default { CosmetologyComponents, cosmetologyRoutes, SafeComponent };
