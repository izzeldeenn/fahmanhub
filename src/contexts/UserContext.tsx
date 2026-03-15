'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { getAccountId, getAccountInfo } from '@/utils/deviceId';
import { useGamification } from '@/contexts/GamificationContext';
import { formatStudyTime } from '@/utils/timeFormat';
import { userDB, isSupabaseAvailable, UserAccount, UserAccountFrontend } from '@/lib/supabase';

// Virtual Users System
const ARABIC_NAMES = [
  'أحمد محمد', 'فاطمة علي', 'عبدالله خالد', 'مريم سالم', 'خالد عمر',
  'نورا حسن', 'يوسف إبراهيم', 'سارة محمود', 'عمر عبدالرحمن', 'ليلى أحمد',
  'محمد سعيد', 'زينب عادل', 'حسن راشد', 'أمل خالد', 'باسل ياسر',
  'رنا ماجد', 'طارق حسين', 'داليا سامي', 'فيصل ناصر', 'هند محسن'
];

const ENGLISH_NAMES = [
  'John Smith', 'Emma Johnson', 'Michael Brown', 'Sarah Davis', 'David Wilson',
  'Lisa Anderson', 'James Taylor', 'Jennifer Thomas', 'Robert Jackson', 'Maria Garcia',
  'William Martinez', 'Linda Rodriguez', 'Richard Lee', 'Patricia White', 'Charles Harris',
  'Barbara Clark', 'Joseph Lewis', 'Susan Walker', 'Thomas Hall', 'Jessica Allen'
];

const AVATAR_EMOJIS = ['👨‍💻', '👩‍💻', '🧑‍🎓', '👨‍🎓', '👩‍🎓', '🧑‍💼', '👨‍💼', '👩‍💼', '🧑‍🔬', '👨‍🔬', '👩‍🔬', '🧑‍🏫', '👨‍🏫', '👩‍🏫', '🧑‍⚕️', '👨‍⚕️', '👩‍⚕️'];

interface VirtualUser {
  id: string;
  username: string;
  avatar: string;
  studyTime: number;
  isActive: boolean;
  lastStudyTime: number;
  studyPattern: 'consistent' | 'burst' | 'irregular';
  nextStudyTime: number;
  studyDuration: number;
}

class VirtualUsersManager {
  private virtualUsers: VirtualUser[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private currentRealUsers: UserAccountFrontend[] = [];
  private static instance: VirtualUsersManager | null = null;
  private readonly STORAGE_KEY = 'fahman-hub-virtual-users-state';

  public static getInstance(): VirtualUsersManager {
    if (!VirtualUsersManager.instance) {
      VirtualUsersManager.instance = new VirtualUsersManager();
    }
    return VirtualUsersManager.instance;
  }

  private constructor() {
    this.initializeVirtualUsers();
    this.startVirtualUserSimulation();
  }

  private initializeVirtualUsers() {
    const allNames = [...ARABIC_NAMES, ...ENGLISH_NAMES];
    const totalVirtualUsers = Math.min(15, Math.floor(Math.random() * 8) + 8); // 8-15 virtual users
    
    // Use fixed seed for consistent virtual users across all clients
    const seed = 'fahman-hub-virtual-users-2024';
    let randomIndex = 0;
    
    const seededRandom = () => {
      const x = Math.sin(seed.charCodeAt(randomIndex++) + randomIndex * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };
    
    const now = Date.now();
    
    // Try to load saved state from localStorage
    const savedState = this.loadVirtualUsersState();
    
    if (savedState && savedState.length > 0) {
      // Load from saved state
      this.virtualUsers = savedState.map((savedUser, index) => ({
        id: savedUser.id || `virtual-${index + 1}`,
        username: savedUser.username || 'Unknown User',
        avatar: savedUser.avatar || '👤',
        studyTime: savedUser.studyTime || 1800,
        isActive: false,
        lastStudyTime: savedUser.lastStudyTime || Date.now() - 3600000,
        studyPattern: savedUser.studyPattern || 'consistent',
        nextStudyTime: now + Math.floor(seededRandom() * 3600000), // Reset next study time
        studyDuration: this.getStudyDuration(savedUser.studyPattern || 'consistent')
      }));
    } else {
      // Create new virtual users
      this.virtualUsers = Array.from({ length: totalVirtualUsers }, (_, index) => {
        const nameIndex = Math.floor(seededRandom() * allNames.length);
        const name = allNames[nameIndex];
        const avatar = AVATAR_EMOJIS[index % AVATAR_EMOJIS.length];
        const patterns: ('consistent' | 'burst' | 'irregular')[] = ['consistent', 'burst', 'irregular'];
        const studyPattern = patterns[index % patterns.length];
        
        return {
          id: `virtual-${index + 1}`,
          username: name,
          avatar,
          studyTime: Math.floor(seededRandom() * 7200) + 1800, // 30 mins to 2.5 hours initial
          isActive: false,
          lastStudyTime: now - Math.floor(seededRandom() * 86400000), // Random time in last 24h
          studyPattern,
          nextStudyTime: now + Math.floor(seededRandom() * 3600000), // Next study within 1 hour
          studyDuration: this.getStudyDuration(studyPattern)
        };
      });
    }
  }

  private loadVirtualUsersState(): Partial<VirtualUser>[] | null {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Check if saved data is not too old (older than 7 days)
          const saveTime = parsed.timestamp || 0;
          const now = Date.now();
          if (now - saveTime < 7 * 24 * 60 * 60 * 1000) { // 7 days
            return parsed.users || [];
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load virtual users state:', error);
    }
    return null;
  }

  private saveVirtualUsersState() {
    try {
      if (typeof window !== 'undefined') {
        const stateToSave = {
          timestamp: Date.now(),
          users: this.virtualUsers.map(user => ({
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            studyTime: user.studyTime,
            lastStudyTime: user.lastStudyTime,
            studyPattern: user.studyPattern
          }))
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToSave));
      }
    } catch (error) {
      console.warn('Failed to save virtual users state:', error);
    }
  }

  private getStudyDuration(pattern: 'consistent' | 'burst' | 'irregular'): number {
    switch (pattern) {
      case 'consistent':
        return 1800000 + Math.random() * 1800000; // 30-60 mins
      case 'burst':
        return 300000 + Math.random() * 900000; // 5-20 mins
      case 'irregular':
        return 600000 + Math.random() * 2400000; // 10-50 mins
      default:
        return 1800000;
    }
  }

  private startVirtualUserSimulation() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.updateVirtualUsers();
    }, 5000); // Update every 5 seconds
    
    // Save state periodically (every minute)
    setInterval(() => {
      this.saveVirtualUsersState();
    }, 60000);
  }

  private updateVirtualUsers() {
    const now = Date.now();
    
    this.virtualUsers.forEach(user => {
      // Check if user should start studying
      if (!user.isActive && now >= user.nextStudyTime) {
        user.isActive = true;
        user.lastStudyTime = now;
        
        // Schedule next study session
        user.nextStudyTime = now + user.studyDuration + (Math.random() * 3600000 * 4); // 0-4 hours break
      }
      // Check if user should stop studying
      else if (user.isActive && (now - user.lastStudyTime) >= user.studyDuration) {
        user.isActive = false;
        user.studyTime += user.studyDuration / 1000; // Convert to seconds
        
        // Update study duration for next session
        user.studyDuration = this.getStudyDuration(user.studyPattern);
        
        // Save state after significant changes
        this.saveVirtualUsersState();
      }
      // If user is currently studying, add time gradually
      else if (user.isActive) {
        const timeToAdd = 5; // 5 seconds per update
        user.studyTime += timeToAdd;
        user.lastStudyTime = now; // Keep lastStudyTime updated
      }
    });
  }

  public getVirtualUsers(): UserAccountFrontend[] {
    const now = Date.now();
    return this.virtualUsers.map(user => ({
      id: user.id,
      accountId: user.id,
      username: user.username,
      email: '',
      hashKey: '',
      avatar: user.avatar,
      score: Math.floor(user.studyTime / 600), // 1 point per 10 minutes
      rank: 0, // Will be calculated later
      studyTime: user.studyTime,
      studyTimeFormatted: formatStudyTime(user.studyTime),
      createdAt: new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random within last 30 days
      lastActive: new Date(typeof user.lastStudyTime === 'number' && user.lastStudyTime > 0 ? user.lastStudyTime : now - 3600000).toISOString() // Fallback to 1 hour ago if invalid
    }));
  }

  public isVirtualUser(accountId: string): boolean {
    return accountId.startsWith('virtual-');
  }

  public updateRealUsers(users: UserAccountFrontend[]) {
    this.currentRealUsers = users;
  }

  public getAllUsers(): UserAccountFrontend[] {
    const virtualUsers = this.getVirtualUsers();
    const allUsers = [...this.currentRealUsers, ...virtualUsers];
    
    // Sort by study time and assign ranks
    allUsers.sort((a, b) => b.studyTime - a.studyTime);
    allUsers.forEach((user, index) => {
      user.rank = index + 1;
    });
    
    return allUsers;
  }

  public destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Convert Supabase DB format to frontend format
const convertToUserAccountFrontend = (dbUser: UserAccount): UserAccountFrontend => ({
  id: dbUser.id,
  accountId: dbUser.account_id,
  username: dbUser.username,
  email: dbUser.email,
  hashKey: dbUser.hash_key,
  avatar: dbUser.avatar,
  score: dbUser.score,
  rank: dbUser.rank,
  studyTime: dbUser.study_time,
  studyTimeFormatted: formatStudyTime(dbUser.study_time),
  createdAt: dbUser.created_at,
  lastActive: dbUser.last_active
});

// Convert frontend format to Supabase DB format
const convertToUserAccount = (user: UserAccountFrontend): UserAccount => ({
  id: user.id,
  account_id: user.accountId,
  username: user.username,
  email: user.email,
  hash_key: user.hashKey,
  avatar: user.avatar,
  score: user.score,
  rank: user.rank,
  study_time: user.studyTime,
  created_at: user.createdAt,
  last_active: user.lastActive
});

interface UserContextType {
  users: UserAccountFrontend[];
  currentAccountId: string;
  isTimerRunning: boolean;
  getCurrentUser: () => UserAccountFrontend | null;
  getAllDeviceUsers: () => UserAccountFrontend[];
  updateUserName: (name: string) => void;
  updateUserAvatar: (avatar: string) => void;
  updateUserStudyTime: (additionalTime: number) => void;
  updateUserScore: (additionalScore: number) => void;
  setTimerActive: (active: boolean) => void;
  isTimerActive: () => boolean;
  isVirtualUser: (accountId: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { addCoins } = useGamification();
  const [users, setUsers] = useState<UserAccountFrontend[]>([]);
  const [currentAccountId, setCurrentAccountId] = useState<string>('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  const dbSyncAccumulator = useRef(0);
  // Use singleton pattern - get the existing instance or create new one
  const virtualUsersManager = VirtualUsersManager.getInstance();

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing UserContext...');
      
      // Get account ID
      console.log('🔍 Getting account ID...');
      const accountId = getAccountId();
      console.log('✅ Account ID:', accountId);
      setCurrentAccountId(accountId);
      
      // Load initial leaderboard
      console.log('📊 Loading initial leaderboard...');
      await loadInitialLeaderboard();
      
      // Set up real-time updates
      try {
        const pocketBaseReady = await isSupabaseAvailable();
        console.log('🔗 Supabase available:', pocketBaseReady);
        if (pocketBaseReady) {
          console.log('🔄 Setting up real-time subscription...');
          userDB.subscribeToUsers((updatedUsers: UserAccount[]) => {
            console.log('🔄 Real-time update received, users count:', updatedUsers.length);
            const userAccounts: UserAccountFrontend[] = updatedUsers.map((dbUser: UserAccount) => ({
              id: dbUser.id,
              accountId: dbUser.account_id,
              username: dbUser.username,
              email: dbUser.email,
              hashKey: dbUser.hash_key,
              avatar: dbUser.avatar || '👤',
              score: dbUser.score,
              rank: dbUser.rank,
              studyTime: dbUser.study_time,
              studyTimeFormatted: formatStudyTime(dbUser.study_time),
              createdAt: dbUser.created_at,
              lastActive: dbUser.last_active
            }));
            console.log('📊 Mapped users to frontend format:', userAccounts.length);
            
            // Update virtual users manager with real users
            virtualUsersManager.updateRealUsers(userAccounts);
            
            // Always preserve current user local changes
            const currentUser = users.find(u => u.accountId === currentAccountId);
            if (currentUser) {
              const updatedCurrentUser = userAccounts.find(u => u.accountId === currentAccountId);
              if (updatedCurrentUser) {
                // Always keep local username and avatar for current user
                updatedCurrentUser.username = currentUser.username;
                updatedCurrentUser.avatar = currentUser.avatar;
                updatedCurrentUser.lastActive = currentUser.lastActive;
              }
            }
            
            setUsers(userAccounts);
          });
          console.log('✅ Real-time subscription established');
        } else {
          console.log('🔄 Real-time updates disabled (Supabase not available)');
        }
      } catch (error) {
        console.log('🔄 Real-time subscription failed, using fallback mode');
        // Continue without real-time updates
      }
      
      console.log('✅ UserContext initialization complete');
    };
    
    initializeApp();
    
    // Cleanup subscription on unmount
    return () => {
      userDB.unsubscribeFromUsers();
      virtualUsersManager.destroy();
    };
  }, []);


  const loadInitialLeaderboard = async () => {
    console.log('📊 Starting loadInitialLeaderboard...');
    try {
      // Get current account ID for comparison
      const currentAccountId = getAccountId();
      console.log('🔍 Current account ID for comparison:', currentAccountId);
      
      // Check if Supabase is available
      const pocketBaseReady = await isSupabaseAvailable();
      console.log('🔗 Supabase available:', pocketBaseReady);
      
      if (pocketBaseReady) {
        console.log('🗄️ Using Supabase database');
        console.log('📊 Fetching users from Supabase...');
        // Try Supabase first
        const users = await userDB.getAllUsers();
        console.log('📊 Retrieved users from Supabase:', users.length);
        
        if (users && users.length > 0) {
          console.log('📊 Mapping users to frontend format...');
          const userAccounts: UserAccountFrontend[] = users.map((dbUser: UserAccount) => ({
              id: dbUser.id,
              accountId: dbUser.account_id,
              username: dbUser.username,
              email: dbUser.email,
              hashKey: dbUser.hash_key,
              avatar: dbUser.avatar || '👤',
              score: dbUser.score,
              rank: dbUser.rank,
              studyTime: dbUser.study_time,
              studyTimeFormatted: formatStudyTime(dbUser.study_time),
              createdAt: dbUser.created_at,
              lastActive: dbUser.last_active
            }));
          console.log('📊 Mapped users:', userAccounts.length);
          
          // Check if current user exists in the database
          const currentUserExists = userAccounts.some(user => user.accountId === currentAccountId);
          console.log('🔍 Current user exists in database:', currentUserExists);
          
          if (!currentUserExists) {
            console.log('🔧 Current user not found, creating new account...');
            createCurrentAccount();
          } else {
            console.log('✅ Current user found, loading existing users');
            setUsers(userAccounts);
            console.log('✅ Loaded leaderboard from Supabase');
          }
        } else {
          console.log('📊 No users in Supabase, creating new account...');
          createCurrentAccount();
        }
      } else {
        console.log('💾 Using in-memory storage (Supabase not available)');
        // Fallback to in-memory storage
        createCurrentAccount();
      }
    } catch (error) {
      console.log('💾 Using in-memory storage (Supabase error):', error);
      // Fallback to in-memory storage until Supabase is set up
      createCurrentAccount();
    }
    
    console.log('📊 loadInitialLeaderboard complete');
  };

  const createCurrentAccount = async () => {
    console.log('🔧 Creating current account...');
    const accountInfo = getAccountInfo();
    console.log('📋 Account info:', accountInfo);
    
    const currentAccount: UserAccountFrontend = {
      id: '', // Will be set by database
      accountId: accountInfo.accountId,
      username: accountInfo.username,
      email: accountInfo.email,
      hashKey: accountInfo.hashKey,
      avatar: '👤',
      score: 0,
      rank: 1,
      studyTime: 0,
      studyTimeFormatted: formatStudyTime(0),
      createdAt: accountInfo.createdAt,
      lastActive: accountInfo.lastLogin
    };
    
    console.log('💾 Saving account to database...');
    await saveAccountToDatabase(currentAccount);
    console.log('📊 Setting users array with current account');
    setUsers([currentAccount]);
    console.log('✅ Current account created and set');
  };

  const saveAccountToDatabase = async (userAccount: UserAccountFrontend) => {
    try {
      console.log('💾 Saving account to database:', userAccount.accountId);
      console.log('📋 Account data to save:', userAccount);
      
      // Save account to Supabase
      const result = await userDB.upsertUser({
        account_id: userAccount.accountId,
        username: userAccount.username,
        email: userAccount.email,
        hash_key: userAccount.hashKey,
        avatar: userAccount.avatar,
        score: userAccount.score,
        rank: userAccount.rank,
        study_time: userAccount.studyTime,
        created_at: userAccount.createdAt,
        last_active: userAccount.lastActive
      });
      
      console.log('✅ Account saved to database successfully:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Error saving account to database:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return null;
    }
  };

  const getCurrentUser = (): UserAccountFrontend | null => {
    if (!currentAccountId) return null;
    return users.find(user => user.accountId === currentAccountId) || null;
  };

  const updateUserName = (name: string) => {
    if (!currentAccountId) return;
    
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.accountId === currentAccountId) {
          return { ...user, username: name, lastActive: new Date().toISOString() };
        }
        return user;
      });
      return newUsers;
    });
    
    // Update in Supabase immediately to ensure consistency
    isSupabaseAvailable().then(available => {
      if (available) {
        userDB.updateUserProfile(currentAccountId, name).catch((error: any) => {
          console.error('Error updating username:', error);
        });
      }
    });
  };

  const updateUserAvatar = (avatar: string) => {
    if (!currentAccountId) return;
    
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.accountId === currentAccountId) {
          return { ...user, avatar, lastActive: new Date().toISOString() };
        }
        return user;
      });
      return newUsers;
    });
    
    // Update in Supabase immediately to ensure consistency
    isSupabaseAvailable().then(available => {
      if (available) {
        // Only update avatar, don't touch username
        userDB.updateUserProfile(currentAccountId, '', avatar).catch((error: any) => {
          console.error('Error updating avatar:', error);
        });
      }
    });
  };

  const updateUserStudyTime = async (additionalTime: number) => {
    if (!currentAccountId) return;

    const pointsEarned = Math.floor(additionalTime / 10); // 1 point per 10 seconds

    // Accumulate time for database sync
    dbSyncAccumulator.current += additionalTime;

    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.accountId === currentAccountId) {
          return {
            ...user,
            studyTime: user.studyTime + additionalTime,
            score: user.score + pointsEarned,
            lastActive: new Date().toISOString(),
            studyTimeFormatted: formatStudyTime(user.studyTime + additionalTime)
          };
        }
        return user;
      });

      // Sort by score and update ranks
      newUsers.sort((a, b) => b.score - a.score);
      newUsers.forEach((user, index) => {
        user.rank = index + 1;
      });

      // Send to database every 10 seconds
      if (dbSyncAccumulator.current >= 10) {
        const currentUser = newUsers.find(u => u.accountId === currentAccountId);
        if (currentUser) {
          // Check if PocketBase is available before saving
          isSupabaseAvailable().then(available => {
            if (available) {
              userDB.updateUserStudyTime(
                currentAccountId,
                currentUser.studyTime,
                currentUser.score
              ).then(() => {
                console.log('💾 User study time saved to PocketBase');
              }).catch((error: any) => {
                console.error('Error saving user study time:', error);
              });
            } else {
              console.log('💾 PocketBase not available, using in-memory storage');
            }
          });
        }
        dbSyncAccumulator.current = 0;
      }

      return newUsers;
    });

    // Add coins to gamification system
    addCoins(pointsEarned);
  };

  const updateUserScore = async (additionalScore: number) => {
    if (!currentAccountId) return;

    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.accountId === currentAccountId) {
          return { ...user, score: user.score + additionalScore, lastActive: new Date().toISOString() };
        }
        return user;
      });
      return newUsers;
    });
  };

  const getAllDeviceUsers = (): UserAccountFrontend[] => {
    // Update virtual users manager with current real users
    virtualUsersManager.updateRealUsers(users);
    
    // Get all users including virtual ones
    const allUsers = virtualUsersManager.getAllUsers() || users;
    
    return allUsers.map(user => ({
      ...user,
      studyTimeFormatted: formatStudyTime(user.studyTime)
    }));
  };

  const isVirtualUser = (accountId: string): boolean => {
    return virtualUsersManager.isVirtualUser(accountId);
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
      currentAccountId,
      isTimerRunning,
      getCurrentUser,
      getAllDeviceUsers,
      updateUserName,
      updateUserAvatar,
      updateUserStudyTime,
      updateUserScore,
      setTimerActive,
      isTimerActive,
      isVirtualUser
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