'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

interface StripeContextValue {
  isReady: boolean;
}

const StripeContext = createContext<StripeContextValue | undefined>(undefined);

export function StripeProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="pricing-table.js"]')) {
      setIsReady(true);
      return;
    }

    // Load Stripe.js for embedded components
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    script.onload = () => setIsReady(true);
    document.body.appendChild(script);

    return () => {
      // Don't remove the script on cleanup as it may be needed by other components
    };
  }, []);

  return (
    <StripeContext.Provider value={{ isReady }}>
      {children}
    </StripeContext.Provider>
  );
}

export function useStripeContext() {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripeContext must be used within a StripeProvider');
  }
  return context;
}
