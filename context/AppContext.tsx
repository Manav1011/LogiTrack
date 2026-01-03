import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Office, Parcel, ParcelStatus, TrackingEvent, UserRole, NotificationLog } from '../types';

interface AppContextType {
  currentUser: User | null;
  offices: Office[];
  parcels: Parcel[];
  notifications: NotificationLog[];
  login: (role: UserRole, officeId?: string) => void;
  logout: () => void;
  addOffice: (office: Office) => void;
  createParcel: (parcel: Omit<Parcel, 'id' | 'trackingId' | 'history' | 'currentStatus' | 'createdAt'>) => void;
  updateParcelStatus: (parcelId: string, newStatus: ParcelStatus, note?: string) => void;
  getOfficeName: (id: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// MOCK DATA
const MOCK_OFFICES: Office[] = [
  { id: 'off_1', name: 'Central Hub NY', city: 'New York', code: 'NYC' },
  { id: 'off_2', name: 'Boston Branch', city: 'Boston', code: 'BOS' },
  { id: 'off_3', name: 'Philly Station', city: 'Philadelphia', code: 'PHL' },
];

const MOCK_USERS: User[] = [
  { id: 'u_1', name: 'Super Admin', role: UserRole.SUPER_ADMIN },
  { id: 'u_2', name: 'NY Manager', role: UserRole.OFFICE_ADMIN, officeId: 'off_1' },
  { id: 'u_3', name: 'Boston Manager', role: UserRole.OFFICE_ADMIN, officeId: 'off_2' },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [offices, setOffices] = useState<Office[]>(MOCK_OFFICES);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);

  // Helper to log "SMS"
  const sendFakeSMS = (recipient: string, phone: string, message: string) => {
    const newLog: NotificationLog = {
      id: Date.now().toString() + Math.random(),
      timestamp: Date.now(),
      recipient,
      phone,
      message
    };
    setNotifications(prev => [newLog, ...prev]);
  };

  const login = (role: UserRole, officeId?: string) => {
    // Simple mock login logic
    if (role === UserRole.SUPER_ADMIN) {
      setCurrentUser(MOCK_USERS[0]);
    } else if (role === UserRole.OFFICE_ADMIN && officeId) {
      const mockUser = { 
        id: `u_${Date.now()}`, 
        name: `${getOfficeName(officeId)} Admin`, 
        role: UserRole.OFFICE_ADMIN, 
        officeId 
      };
      setCurrentUser(mockUser);
    } else {
      setCurrentUser({ id: 'public', name: 'Guest', role: UserRole.PUBLIC });
    }
  };

  const logout = () => setCurrentUser(null);

  const addOffice = (office: Office) => {
    setOffices([...offices, office]);
  };

  const getOfficeName = (id: string) => offices.find(o => o.id === id)?.name || 'Unknown Office';

  const createParcel = (data: Omit<Parcel, 'id' | 'trackingId' | 'history' | 'currentStatus' | 'createdAt'>) => {
    const trackingId = `TRK-${Math.floor(100000 + Math.random() * 900000)}`;
    const sourceName = getOfficeName(data.sourceOfficeId);
    
    const newParcel: Parcel = {
      ...data,
      id: `p_${Date.now()}`,
      trackingId,
      currentStatus: ParcelStatus.BOOKED,
      createdAt: Date.now(),
      history: [{
        status: ParcelStatus.BOOKED,
        timestamp: Date.now(),
        location: sourceName,
        note: 'Parcel booked at source office'
      }]
    };

    setParcels(prev => [newParcel, ...prev]);

    // Send SMS
    sendFakeSMS('Sender', data.senderPhone, `Your parcel ${trackingId} to ${data.receiverName} is booked!`);
    sendFakeSMS('Receiver', data.receiverPhone, `A parcel from ${data.senderName} (${trackingId}) has been booked for you.`);
  };

  const updateParcelStatus = (parcelId: string, newStatus: ParcelStatus, note: string = '') => {
    setParcels(prev => prev.map(p => {
      if (p.id !== parcelId) return p;

      // Determine location based on user (assume current user handles it)
      let location = 'Transit';
      if (currentUser?.officeId) {
        location = getOfficeName(currentUser.officeId);
      } else if (currentUser?.role === UserRole.SUPER_ADMIN) {
        location = "HQ Update";
      }

      const updatedHistory = [...p.history, {
        status: newStatus,
        timestamp: Date.now(),
        location,
        note
      }];

      // SMS Logic based on status
      if (newStatus === ParcelStatus.IN_TRANSIT) {
        sendFakeSMS('Receiver', p.receiverPhone, `Parcel ${p.trackingId} is now in transit.`);
      } else if (newStatus === ParcelStatus.ARRIVED) {
         sendFakeSMS('Receiver', p.receiverPhone, `Good news! Parcel ${p.trackingId} has arrived at destination office.`);
      } else if (newStatus === ParcelStatus.DELIVERED) {
         sendFakeSMS('Sender', p.senderPhone, `Parcel ${p.trackingId} was successfully delivered.`);
         sendFakeSMS('Receiver', p.receiverPhone, `You have collected parcel ${p.trackingId}. Thanks!`);
      }

      return {
        ...p,
        currentStatus: newStatus,
        history: updatedHistory
      };
    }));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      offices,
      parcels,
      notifications,
      login,
      logout,
      addOffice,
      createParcel,
      updateParcelStatus,
      getOfficeName
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};