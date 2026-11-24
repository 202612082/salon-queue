import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getQueueState,
  subscribeQueue,
  joinQueue,
  callNextCustomer,
  callSpecificCustomer,
  startService,
  completeService,
  cancelSpot,
  markNoShow,
  toggleBarberBreak,
  toggleBarberDuty,
  toggleQueueOpen,
  resetToDefaults,
  calculateWaitTimeForCustomer,
  estimateInitialWaitTime,
  getQueuePosition,
  findActiveCustomerByPhone,
} from '../utils/queueEngine';

const QueueContext = createContext();

export const QueueProvider = ({ children }) => {
  const [queueState, setQueueState] = useState(() => getQueueState());

  useEffect(() => {
    // Subscribe to cross-tab updates and local engine broadcasts
    const unsubscribe = subscribeQueue((newState) => {
      setQueueState({ ...newState });
    });
    return unsubscribe;
  }, []);

  const value = {
    queueState,
    joinQueue,
    callNextCustomer,
    callSpecificCustomer,
    startService,
    completeService,
    cancelSpot,
    markNoShow,
    toggleBarberBreak,
    toggleBarberDuty,
    toggleQueueOpen,
    resetToDefaults,
    calculateWaitTimeForCustomer: (tokenId) => calculateWaitTimeForCustomer(tokenId, queueState),
    estimateInitialWaitTime: () => estimateInitialWaitTime(queueState),
    getQueuePosition: (tokenId) => getQueuePosition(tokenId, queueState),
    findActiveCustomerByPhone: (phone) => findActiveCustomerByPhone(phone, queueState),
  };

  return (
    <QueueContext.Provider value={value}>
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};
