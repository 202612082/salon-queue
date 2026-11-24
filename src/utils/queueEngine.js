/**
 * Centralized Queue Engine for Salon Queue Management System
 * Handles localStorage state persistence, cross-tab synchronization via storage events,
 * pre-seeded dummy data (Ravi, Amit, Imran + 6 sample customers), and queue rules.
 */

const STORAGE_KEY = 'SALON_QUEUE_STATE_V1';
const UPDATE_EVENT_NAME = 'salon_queue_state_updated';

// Default initial services catalog
export const DEFAULT_SERVICES = [
  { id: 's1', nameEn: 'Classic Haircut', nameGu: 'ક્લાસિક હેરકટ', duration: 25, price: 150 },
  { id: 's2', nameEn: 'Beard Trim & Shape', nameGu: 'દાઢી સેટિંગ અને શેવિંગ', duration: 15, price: 80 },
  { id: 's3', nameEn: 'Hair Wash & Conditioning', nameGu: 'હેર વોશ અને કંડિશનિંગ', duration: 15, price: 100 },
  { id: 's4', nameEn: 'Relaxing Head Massage', nameGu: 'રિલેક્સિંગ હેડ મસાજ', duration: 20, price: 120 },
  { id: 's5', nameEn: 'Express Face Cleanup', nameGu: 'એક્સપ્રેસ ફેસ ક્લીનઅપ', duration: 30, price: 250 },
  { id: 's6', nameEn: 'Hair Color & Styling', nameGu: 'હેર કલર અને સ્ટાઇલિંગ', duration: 40, price: 300 },
];

// Pre-seeded initial state with Ravi, Amit, Imran + 6 sample customers
export const getInitialData = () => {
  const now = Date.now();
  return {
    isOpen: true,
    lastTokenNumber: 6,
    barbers: [
      {
        id: 'b1',
        name: 'Ravi',
        nameGu: 'રવિ',
        onDuty: true,
        status: 'Busy', // Currently serving S-2
        currentTokenId: 'S-2',
      },
      {
        id: 'b2',
        name: 'Amit',
        nameGu: 'અમિત',
        onDuty: true,
        status: 'Busy', // Has called S-3
        currentTokenId: 'S-3',
      },
      {
        id: 'b3',
        name: 'Imran',
        nameGu: 'ઇમરાન',
        onDuty: true,
        status: 'On Break', // On break
        currentTokenId: null,
      },
    ],
    services: DEFAULT_SERVICES,
    queue: [
      {
        id: 'S-1',
        name: 'Jayesh Patel',
        phone: '9876543210',
        serviceIds: ['s1'],
        preferredBarber: 'Ravi',
        assignedBarber: 'Ravi',
        status: 'Done',
        enteredAt: now - 3600000, // 60 mins ago
        calledAt: now - 3000000,
        startedAt: now - 2700000,
        completedAt: now - 900000, // 15 mins ago
      },
      {
        id: 'S-2',
        name: 'Mehul Shah',
        phone: '9876543211',
        serviceIds: ['s1', 's2'],
        preferredBarber: 'Ravi',
        assignedBarber: 'Ravi',
        status: 'In Chair',
        enteredAt: now - 2400000, // 40 mins ago
        calledAt: now - 1500000,
        startedAt: now - 900000,  // 15 mins ago
        completedAt: null,
      },
      {
        id: 'S-3',
        name: 'Hardik Joshi',
        phone: '9876543212',
        serviceIds: ['s1'],
        preferredBarber: 'Amit',
        assignedBarber: 'Amit',
        status: 'Called',
        enteredAt: now - 1800000, // 30 mins ago
        calledAt: now - 300000,   // 5 mins ago
        startedAt: null,
        completedAt: null,
      },
      {
        id: 'S-4',
        name: 'Pratik Mehta',
        phone: '9876543213',
        serviceIds: ['s4', 's1'],
        preferredBarber: 'Any',
        assignedBarber: null,
        status: 'Waiting',
        enteredAt: now - 1200000, // 20 mins ago
        calledAt: null,
        startedAt: null,
        completedAt: null,
      },
      {
        id: 'S-5',
        name: 'Chirag Dave',
        phone: '9876543214',
        serviceIds: ['s2'],
        preferredBarber: 'Imran',
        assignedBarber: null,
        status: 'Waiting',
        enteredAt: now - 720000,  // 12 mins ago
        calledAt: null,
        startedAt: null,
        completedAt: null,
      },
      {
        id: 'S-6',
        name: 'Ketan Trivedi',
        phone: '9876543215',
        serviceIds: ['s1'],
        preferredBarber: 'Any',
        assignedBarber: null,
        status: 'Waiting',
        enteredAt: now - 300000,  // 5 mins ago
        calledAt: null,
        startedAt: null,
        completedAt: null,
      },
    ],
    dailyStats: {
      servedToday: 1,
      noShowCount: 0,
      cancelledCount: 0,
    },
  };
};

/**
 * Read current queue state from localStorage
 */
export const getQueueState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialData();
      saveQueueState(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse queue state from localStorage', e);
    const initial = getInitialData();
    saveQueueState(initial);
    return initial;
  }
};

/**
 * Save current queue state to localStorage and broadcast cross-tab event
 */
export const saveQueueState = (newState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    // Broadcast local event for the current window/tab
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT_NAME, { detail: newState }));
  } catch (e) {
    console.error('Failed to save queue state to localStorage', e);
  }
};

/**
 * Subscribe to state changes (both local CustomEvent and cross-window storage event)
 */
export const subscribeQueue = (callback) => {
  const handleLocalUpdate = (e) => {
    callback(e.detail || getQueueState());
  };

  const handleStorageEvent = (e) => {
    if (e.key === STORAGE_KEY) {
      callback(getQueueState());
    }
  };

  // 2-second polling fallback to ensure absolute sync even if tab backgrounded
  const intervalId = setInterval(() => {
    callback(getQueueState());
  }, 2000);

  window.addEventListener(UPDATE_EVENT_NAME, handleLocalUpdate);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    clearInterval(intervalId);
    window.removeEventListener(UPDATE_EVENT_NAME, handleLocalUpdate);
    window.removeEventListener('storage', handleStorageEvent);
  };
};

/**
 * Calculation helpers
 */
export const getActiveBarbersCount = (state) => {
  const barbers = state.barbers || [];
  // Barbers on duty and not on break
  const active = barbers.filter(b => b.onDuty && b.status !== 'On Break');
  return Math.max(1, active.length);
};

export const calculateServiceDuration = (serviceIds, services = DEFAULT_SERVICES) => {
  if (!serviceIds || !serviceIds.length) return 0;
  return serviceIds.reduce((sum, id) => {
    const s = services.find(item => item.id === id);
    return sum + (s ? s.duration : 0);
  }, 0);
};

export const calculateServicePrice = (serviceIds, services = DEFAULT_SERVICES) => {
  if (!serviceIds || !serviceIds.length) return 0;
  return serviceIds.reduce((sum, id) => {
    const s = services.find(item => item.id === id);
    return sum + (s ? s.price : 0);
  }, 0);
};

/**
 * Calculate waiting time for a token in queue.
 * Sum of durations of waiting customers ahead divided by active working barbers.
 */
export const calculateWaitTimeForCustomer = (tokenId, state) => {
  const waitingCustomers = (state.queue || []).filter(c => c.status === 'Waiting');
  const index = waitingCustomers.findIndex(c => c.id === tokenId);
  
  if (index === -1) {
    // If called or in chair, wait time to start is 0
    const customer = (state.queue || []).find(c => c.id === tokenId);
    if (customer && (customer.status === 'Called' || customer.status === 'In Chair')) {
      return 0;
    }
    return 0;
  }

  // Sum duration of all waiting customers ahead of this one
  const ahead = waitingCustomers.slice(0, index);
  const totalAheadDuration = ahead.reduce((sum, c) => {
    return sum + calculateServiceDuration(c.serviceIds, state.services);
  }, 0);

  // Add remaining estimated time of currently active services (approx 10 mins default)
  const activeBarbers = getActiveBarbersCount(state);
  const estimatedWait = Math.round((totalAheadDuration + 10) / activeBarbers);
  return Math.max(5, estimatedWait);
};

/**
 * Estimate wait time for a new joiner right now
 */
export const estimateInitialWaitTime = (state) => {
  const waitingCustomers = (state.queue || []).filter(c => c.status === 'Waiting');
  const totalDuration = waitingCustomers.reduce((sum, c) => {
    return sum + calculateServiceDuration(c.serviceIds, state.services);
  }, 0);

  const activeBarbers = getActiveBarbersCount(state);
  return Math.max(5, Math.round((totalDuration + 10) / activeBarbers));
};

/**
 * Get queue position string (e.g. 1st, 2nd, 3rd, 4th)
 */
export const getQueuePosition = (tokenId, state) => {
  const waitingCustomers = (state.queue || []).filter(c => c.status === 'Waiting');
  const index = waitingCustomers.findIndex(c => c.id === tokenId);
  if (index === -1) return null;

  const pos = index + 1;
  const suffix = (pos === 1) ? '1st' : (pos === 2) ? '2nd' : (pos === 3) ? '3rd' : `${pos}th`;
  return { position: pos, positionText: suffix };
};

/**
 * Check if a phone number already has an active spot in queue
 */
export const findActiveCustomerByPhone = (phone, state) => {
  if (!phone) return null;
  const activeStatuses = ['Waiting', 'Called', 'In Chair'];
  const clean = phone.replace(/\D/g, '').slice(-10);
  return (state.queue || []).find(
    c => c.phone.replace(/\D/g, '').slice(-10) === clean && activeStatuses.includes(c.status)
  );
};

/**
 * Queue Engine Actions
 */

export const joinQueue = ({ name, phone, serviceIds, preferredBarber = 'Any' }) => {
  const state = getQueueState();

  if (!state.isOpen) {
    throw new Error('QUEUE_CLOSED');
  }

  const cleanPhone = (phone || '').replace(/\D/g, '');
  if (cleanPhone.length !== 10) {
    throw new Error('INVALID_PHONE');
  }

  if (!name || !name.trim()) {
    throw new Error('NAME_REQUIRED');
  }

  if (!serviceIds || serviceIds.length === 0 || serviceIds.length > 3) {
    throw new Error('INVALID_SERVICES');
  }

  // Check duplicate active phone
  const existing = findActiveCustomerByPhone(cleanPhone, state);
  if (existing) {
    try {
      localStorage.setItem('salon_active_token', existing.id);
    } catch (e) {}
    return { isDuplicate: true, customer: existing };
  }

  const nextNumber = (state.lastTokenNumber || 0) + 1;
  const newTokenId = `S-${nextNumber}`;

  const newCustomer = {
    id: newTokenId,
    name: name.trim(),
    phone: cleanPhone,
    serviceIds,
    preferredBarber: preferredBarber || 'Any',
    assignedBarber: null,
    status: 'Waiting',
    enteredAt: Date.now(),
    calledAt: null,
    startedAt: null,
    completedAt: null,
  };

  const updatedState = {
    ...state,
    lastTokenNumber: nextNumber,
    queue: [...state.queue, newCustomer],
  };

  saveQueueState(updatedState);
  try {
    localStorage.setItem('salon_active_token', newTokenId);
  } catch (e) {}
  return { isDuplicate: false, customer: newCustomer };
};

/**
 * Call next customer for a barber
 * Picks earliest Waiting customer who chose this barber or 'Any'
 */
export const callNextCustomer = (barberName) => {
  const state = getQueueState();
  const barber = state.barbers.find(b => b.name === barberName);

  if (!barber) throw new Error('BARBER_NOT_FOUND');
  if (!barber.onDuty) throw new Error('BARBER_OFF_DUTY');
  if (barber.status === 'On Break') throw new Error('BARBER_ON_BREAK');

  // Single active turn per barber
  if (barber.currentTokenId) {
    const currentCust = state.queue.find(c => c.id === barber.currentTokenId);
    if (currentCust && (currentCust.status === 'Called' || currentCust.status === 'In Chair')) {
      throw new Error('BARBER_ALREADY_BUSY');
    }
  }

  // Find earliest Waiting customer matching barberName or 'Any'
  const eligibleCustomer = state.queue.find(
    c => c.status === 'Waiting' && (c.preferredBarber === barberName || c.preferredBarber === 'Any')
  );

  if (!eligibleCustomer) {
    return null; // No waiting customer
  }

  const updatedQueue = state.queue.map(c => {
    if (c.id === eligibleCustomer.id) {
      return {
        ...c,
        status: 'Called',
        assignedBarber: barberName,
        calledAt: Date.now(),
      };
    }
    return c;
  });

  const updatedBarbers = state.barbers.map(b => {
    if (b.name === barberName) {
      return {
        ...b,
        status: 'Busy',
        currentTokenId: eligibleCustomer.id,
      };
    }
    return b;
  });

  const updatedState = {
    ...state,
    queue: updatedQueue,
    barbers: updatedBarbers,
  };

  saveQueueState(updatedState);
  return eligibleCustomer;
};

/**
 * Call a specific waiting customer to an available eligible barber
 * If targetBarberName is given, verifies that barber is on duty and available.
 * Otherwise, auto-assigns to the customer's preferred barber (if available) or first available barber (if 'Any').
 */
export const callSpecificCustomer = (tokenId, targetBarberName = null) => {
  const state = getQueueState();
  const customer = state.queue.find(c => c.id === tokenId);

  if (!customer) throw new Error('CUSTOMER_NOT_FOUND');
  if (customer.status !== 'Waiting') throw new Error('CUSTOMER_NOT_WAITING');

  let assignedBarber = null;

  if (targetBarberName) {
    const b = state.barbers.find(barber => barber.name === targetBarberName);
    if (!b || !b.onDuty || b.status !== 'Available') {
      throw new Error('BARBER_NOT_AVAILABLE');
    }
    if (customer.preferredBarber !== 'Any' && customer.preferredBarber !== targetBarberName) {
      throw new Error('BARBER_MISMATCH');
    }
    assignedBarber = b;
  } else {
    // Auto-pick available barber matching preference
    if (customer.preferredBarber !== 'Any') {
      const b = state.barbers.find(
        barber => barber.name === customer.preferredBarber && barber.onDuty && barber.status === 'Available'
      );
      if (b) assignedBarber = b;
    } else {
      // Pick first available on-duty barber
      const b = state.barbers.find(barber => barber.onDuty && barber.status === 'Available');
      if (b) assignedBarber = b;
    }
  }

  if (!assignedBarber) {
    return null; // No available barber matching customer
  }

  const updatedQueue = state.queue.map(c => {
    if (c.id === tokenId) {
      return {
        ...c,
        status: 'Called',
        assignedBarber: assignedBarber.name,
        calledAt: Date.now(),
      };
    }
    return c;
  });

  const updatedBarbers = state.barbers.map(b => {
    if (b.name === assignedBarber.name) {
      return {
        ...b,
        status: 'Busy',
        currentTokenId: tokenId,
      };
    }
    return b;
  });

  const updatedState = {
    ...state,
    queue: updatedQueue,
    barbers: updatedBarbers,
  };

  saveQueueState(updatedState);
  return { customer: { ...customer, status: 'Called', assignedBarber: assignedBarber.name }, barber: assignedBarber };
};

/**
 * Start service (Called -> In Chair)
 */
export const startService = (tokenId) => {
  const state = getQueueState();
  const customer = state.queue.find(c => c.id === tokenId);
  if (!customer || customer.status !== 'Called') {
    throw new Error('INVALID_TRANSITION');
  }

  const updatedQueue = state.queue.map(c => {
    if (c.id === tokenId) {
      return {
        ...c,
        status: 'In Chair',
        startedAt: Date.now(),
      };
    }
    return c;
  });

  const updatedState = {
    ...state,
    queue: updatedQueue,
  };

  saveQueueState(updatedState);
  return true;
};

/**
 * Complete service (In Chair -> Done)
 */
export const completeService = (tokenId) => {
  const state = getQueueState();
  const customer = state.queue.find(c => c.id === tokenId);
  if (!customer || customer.status !== 'In Chair') {
    throw new Error('INVALID_TRANSITION');
  }

  const updatedQueue = state.queue.map(c => {
    if (c.id === tokenId) {
      return {
        ...c,
        status: 'Done',
        completedAt: Date.now(),
      };
    }
    return c;
  });

  // Free assigned barber
  const updatedBarbers = state.barbers.map(b => {
    if (b.name === customer.assignedBarber) {
      return {
        ...b,
        status: b.status === 'On Break' ? 'On Break' : 'Available',
        currentTokenId: null,
      };
    }
    return b;
  });

  const updatedStats = {
    ...state.dailyStats,
    servedToday: (state.dailyStats?.servedToday || 0) + 1,
  };

  const updatedState = {
    ...state,
    queue: updatedQueue,
    barbers: updatedBarbers,
    dailyStats: updatedStats,
  };

  saveQueueState(updatedState);
  try {
    if (localStorage.getItem('salon_active_token') === tokenId) {
      localStorage.removeItem('salon_active_token');
    }
  } catch (e) {}
  return true;
};

/**
 * Cancel spot in queue (Allowed from Waiting)
 */
export const cancelSpot = (tokenId) => {
  const state = getQueueState();
  const customer = state.queue.find(c => c.id === tokenId);
  if (!customer || customer.status !== 'Waiting') {
    throw new Error('CAN_ONLY_CANCEL_WAITING');
  }

  const updatedQueue = state.queue.map(c => {
    if (c.id === tokenId) {
      return { ...c, status: 'Cancelled' };
    }
    return c;
  });

  const updatedStats = {
    ...state.dailyStats,
    cancelledCount: (state.dailyStats?.cancelledCount || 0) + 1,
  };

  const updatedState = {
    ...state,
    queue: updatedQueue,
    dailyStats: updatedStats,
  };

  saveQueueState(updatedState);
  try {
    if (localStorage.getItem('salon_active_token') === tokenId) {
      localStorage.removeItem('salon_active_token');
    }
  } catch (e) {}
  return true;
};

/**
 * Mark No-Show (Allowed from Called)
 */
export const markNoShow = (tokenId) => {
  const state = getQueueState();
  const customer = state.queue.find(c => c.id === tokenId);
  if (!customer || customer.status !== 'Called') {
    throw new Error('CAN_ONLY_MARK_NOSHOW_CALLED');
  }

  const updatedQueue = state.queue.map(c => {
    if (c.id === tokenId) {
      return { ...c, status: 'No-Show' };
    }
    return c;
  });

  // Free assigned barber
  const updatedBarbers = state.barbers.map(b => {
    if (b.name === customer.assignedBarber) {
      return {
        ...b,
        status: 'Available',
        currentTokenId: null,
      };
    }
    return b;
  });

  const updatedStats = {
    ...state.dailyStats,
    noShowCount: (state.dailyStats?.noShowCount || 0) + 1,
  };

  const updatedState = {
    ...state,
    queue: updatedQueue,
    barbers: updatedBarbers,
    dailyStats: updatedStats,
  };

  saveQueueState(updatedState);
  try {
    if (localStorage.getItem('salon_active_token') === tokenId) {
      localStorage.removeItem('salon_active_token');
    }
  } catch (e) {}
  return true;
};

/**
 * Toggle barber break status (Available <-> On Break)
 */
export const toggleBarberBreak = (barberName) => {
  const state = getQueueState();
  const updatedBarbers = state.barbers.map(b => {
    if (b.name === barberName) {
      const nextStatus = b.status === 'On Break' ? 'Available' : 'On Break';
      return { ...b, status: nextStatus };
    }
    return b;
  });

  const updatedState = { ...state, barbers: updatedBarbers };
  saveQueueState(updatedState);
  return true;
};

/**
 * Toggle barber duty (On Duty / Off Duty)
 */
export const toggleBarberDuty = (barberName) => {
  const state = getQueueState();
  const updatedBarbers = state.barbers.map(b => {
    if (b.name === barberName) {
      return { ...b, onDuty: !b.onDuty };
    }
    return b;
  });

  const updatedState = { ...state, barbers: updatedBarbers };
  saveQueueState(updatedState);
  return true;
};

/**
 * Toggle queue open / closed
 */
export const toggleQueueOpen = (isOpen) => {
  const state = getQueueState();
  const nextOpen = typeof isOpen === 'boolean' ? isOpen : !state.isOpen;
  const updatedState = { ...state, isOpen: nextOpen };
  saveQueueState(updatedState);
  return nextOpen;
};

/**
 * Add a new service to the menu
 */
export const addService = ({ nameEn, nameGu, duration, price }) => {
  const state = getQueueState();
  const newId = `s_${Date.now()}`;
  const newService = {
    id: newId,
    nameEn: (nameEn || '').trim(),
    nameGu: (nameGu || '').trim() || (nameEn || '').trim(),
    duration: Number(duration) || 15,
    price: Number(price) || 100,
  };

  const updatedState = {
    ...state,
    services: [...(state.services || []), newService],
  };

  saveQueueState(updatedState);
  return newService;
};

/**
 * Update an existing service
 */
export const updateService = (serviceId, { nameEn, nameGu, duration, price }) => {
  const state = getQueueState();
  const updatedServices = (state.services || []).map(s => {
    if (s.id === serviceId) {
      return {
        ...s,
        nameEn: (nameEn || '').trim() || s.nameEn,
        nameGu: (nameGu || '').trim() || s.nameGu,
        duration: Number(duration) || s.duration,
        price: Number(price) || s.price,
      };
    }
    return s;
  });

  const updatedState = {
    ...state,
    services: updatedServices,
  };

  saveQueueState(updatedState);
  return true;
};

/**
 * Delete a service from the menu (safeguards minimum 1 service)
 */
export const deleteService = (serviceId) => {
  const state = getQueueState();
  if ((state.services || []).length <= 1) {
    throw new Error('MIN_ONE_SERVICE_REQUIRED');
  }

  const updatedServices = (state.services || []).filter(s => s.id !== serviceId);
  const updatedState = {
    ...state,
    services: updatedServices,
  };

  saveQueueState(updatedState);
  return true;
};

/**
 * Calculate dynamic average wait time in minutes
 */
export const calculateAverageWaitTime = (state) => {
  const served = (state.queue || []).filter(c => c.status === 'Done' || c.status === 'In Chair');
  if (served.length > 0) {
    const totalMins = served.reduce((acc, c) => {
      const waitMs = (c.startedAt || c.calledAt || c.completedAt || Date.now()) - c.enteredAt;
      return acc + Math.max(5, Math.round(waitMs / 60000));
    }, 0);
    return Math.max(5, Math.round(totalMins / served.length));
  }
  return 15;
};

/**
 * Reset demo data to initial state
 */
export const resetToDefaults = () => {
  const initial = getInitialData();
  saveQueueState(initial);
  return initial;
};
