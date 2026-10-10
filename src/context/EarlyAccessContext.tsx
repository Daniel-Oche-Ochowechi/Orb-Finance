'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EarlyAccessContextType {
  isOpen: boolean;
  initialRole: string;
  openEarlyAccess: (role?: string) => void;
  closeEarlyAccess: () => void;
}

const EarlyAccessContext = createContext<EarlyAccessContextType | undefined>(undefined);

export function EarlyAccessProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialRole, setInitialRole] = useState('Bank');

  const openEarlyAccess = (role = 'Bank') => {
    setInitialRole(role);
    setIsOpen(true);
  };

  const closeEarlyAccess = () => {
    setIsOpen(false);
  };

  return (
    <EarlyAccessContext.Provider
      value={{
        isOpen,
        initialRole,
        openEarlyAccess,
        closeEarlyAccess,
      }}
    >
      {children}
    </EarlyAccessContext.Provider>
  );
}

export function useEarlyAccess() {
  const context = useContext(EarlyAccessContext);
  if (!context) {
    throw new Error('useEarlyAccess must be used within an EarlyAccessProvider');
  }
  return context;
}
