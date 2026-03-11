'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getDeviceId, getDeviceInfo } from '@/utils/deviceId';
import { useGamification } from '@/contexts/GamificationContext';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface DeviceUser {
  deviceId: string;
  name: string;
  avatar?: string;
  score: number;
  rank: number;
  studyTime: number; // in seconds
  createdAt: string;
  lastActive: string;
}

interface UserContextType {
  users: DeviceUser[];
  getCurrentDeviceUser: () => DeviceUser | null;
  updateDeviceUserName: (name: string) => void;
  updateDeviceUserAvatar: (avatar: string) => void;
  updateDeviceStudyTime: (additionalTime: number) => void;
  getAllDeviceUsers: () => DeviceUser[];
  setTimerActive: (isActive: boolean) => void;
  isTimerActive: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { addCoins } = useGamification();
  const [users, setUsers] = useState<DeviceUser[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    // Get device ID
    const deviceId = getDeviceId();
    setCurrentDeviceId(deviceId);
    
    // Load users from Supabase
    loadUsersFromDatabase();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('devices')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'devices' },
        (payload) => {
          console.log('Real-time update:', payload);
          loadUsersFromDatabase();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUsersFromDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('score', { ascending: false });

      if (error) {
        console.error('Error loading devices:', error);
        // Fallback to demo devices if database fails
        loadDemoDevices();
        return;
      }

      if (data && data.length > 0) {
        const deviceUsers: DeviceUser[] = data.map((dbDevice: any) => ({
          deviceId: dbDevice.id,
          name: dbDevice.name,
          avatar: dbDevice.avatar || '🖥️',
          score: dbDevice.score,
          rank: dbDevice.rank,
          studyTime: dbDevice.study_time,
          createdAt: dbDevice.created_at,
          lastActive: dbDevice.last_active
        }));
        setUsers(deviceUsers);
      } else {
        // No devices in database, create demo devices
        loadDemoDevices();
      }
    } catch (error) {
      console.error('Database error:', error);
      loadDemoDevices();
    }
  };

  const loadDemoDevices = async () => {
    const demoDevices: DeviceUser[] = [
      {
        deviceId: 'demo-1',
        name: 'جهاز احمد',
        avatar: '💻',
        score: 850,
        rank: 1,
        studyTime: 7200, // 2 hours
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      },
      {
        deviceId: 'demo-2', 
        name: 'جهاز محمد',
        avatar: '📱',
        score: 750,
        rank: 2,
        studyTime: 5400, // 1.5 hours
        createdAt: new Date().toISOString(),
        lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
      },
      {
        deviceId: 'demo-3',
        name: 'جهاز فاطمة',
        avatar: '🎮',
        score: 420,
        rank: 3,
        studyTime: 3600, // 1 hour
        createdAt: new Date().toISOString(),
        lastActive: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago
      }
    ];
    
    // Save demo devices to database
    for (const device of demoDevices) {
      await saveDeviceToDatabase(device);
    }
    
    // Also create current device
    const deviceId = getDeviceId();
    const currentDevice: DeviceUser = {
      deviceId,
      name: `جهاز ${deviceId.slice(-6)}`,
      avatar: '🖥️',
      score: 0,
      rank: 4,
      studyTime: 0,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    await saveDeviceToDatabase(currentDevice);
    
    setUsers([...demoDevices, currentDevice]);
  };

  const saveDeviceToDatabase = async (deviceUser: DeviceUser) => {
    try {
      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co') {
        return; // Silently skip if not configured
      }

      const { error } = await supabase
        .from('devices')
        .upsert({
          id: deviceUser.deviceId,
          name: deviceUser.name,
          avatar: deviceUser.avatar,
          score: deviceUser.score,
          rank: deviceUser.rank,
          study_time: deviceUser.studyTime,
          created_at: deviceUser.createdAt,
          last_active: deviceUser.lastActive
        });

      // Only log errors that have actual content
      if (error && error.message) {
        console.error('Error saving device:', error.message);
      }
    } catch (error) {
      // Silently handle database errors when not configured
    }
  };

  const updateDeviceInDatabase = async (deviceId: string, updates: Partial<DeviceUser>) => {
    try {
      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co') {
        return; // Silently skip if not configured
      }

      const { error } = await supabase
        .from('devices')
        .update({
          ...updates,
          last_active: new Date().toISOString()
        })
        .eq('id', deviceId);

      // Only log errors that have actual content
      if (error && error.message) {
        console.error('Error updating device:', error.message);
      }
    } catch (error) {
      // Silently handle database errors when not configured
    }
  };

  const getCurrentDeviceUser = (): DeviceUser | null => {
    if (!currentDeviceId) return null;
    return users.find(user => user.deviceId === currentDeviceId) || null;
  };

  const updateDeviceUserName = (name: string) => {
    if (!currentDeviceId) return;
    
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.deviceId === currentDeviceId) {
          return { ...user, name, lastActive: new Date().toISOString() };
        }
        return user;
      });
      return newUsers;
    });
    
    // Update in database
    updateDeviceInDatabase(currentDeviceId, { name });
  };

  const updateDeviceUserAvatar = (avatar: string) => {
    if (!currentDeviceId) return;
    
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.deviceId === currentDeviceId) {
          return { ...user, avatar, lastActive: new Date().toISOString() };
        }
        return user;
      });
      return newUsers;
    });
    
    // Update in database
    updateDeviceInDatabase(currentDeviceId, { avatar });
  };

  const updateDeviceStudyTime = (additionalTime: number) => {
    if (!currentDeviceId) return;
    
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.deviceId === currentDeviceId) {
          const pointsEarned = Math.floor(additionalTime / 10); // 1 point per 10 seconds
          addCoins(pointsEarned); // Add coins to gamification system
          
          return {
            ...user,
            studyTime: user.studyTime + additionalTime,
            score: user.score + pointsEarned,
            lastActive: new Date().toISOString()
          };
        }
        return user;
      });

      // Sort by score and update ranks
      newUsers.sort((a, b) => b.score - a.score);
      newUsers.forEach((user, index) => {
        user.rank = index + 1;
      });

      return newUsers;
    });
    
    // Update in database
    const currentUser = users.find(u => u.deviceId === currentDeviceId);
    if (currentUser) {
      updateDeviceInDatabase(currentDeviceId, {
        studyTime: currentUser.studyTime + additionalTime,
        score: currentUser.score + Math.floor(additionalTime / 10)
      });
    }
  };

  const getAllDeviceUsers = (): DeviceUser[] => {
    return users.sort((a, b) => b.score - a.score);
  };

  const setTimerActive = (isActive: boolean) => {
    setIsTimerRunning(isActive);
  };

  const isTimerActive = (): boolean => {
    return isTimerRunning;
  };

  return (
    <UserContext.Provider value={{
      users,
      getCurrentDeviceUser,
      updateDeviceUserName,
      updateDeviceUserAvatar,
      updateDeviceStudyTime,
      getAllDeviceUsers,
      setTimerActive,
      isTimerActive
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
