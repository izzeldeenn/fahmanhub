'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';

interface DeviceUser {
  deviceId: string;
  name: string;
  avatar?: string;
  score: number;
  rank: number;
  studyTime: number;
  createdAt: string;
  lastActive: string;
}

export function UserRankings() {
  const { theme } = useTheme();
  const { getAllDeviceUsers, isTimerActive } = useUser();
  const [displayUsers, setDisplayUsers] = useState<DeviceUser[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setDisplayUsers(getAllDeviceUsers());
  }, [getAllDeviceUsers]);

  useEffect(() => {
    // Update rankings every second for live changes
    const interval = setInterval(() => {
      setDisplayUsers(getAllDeviceUsers());
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [getAllDeviceUsers]);

  const formatStudyTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTodayStudyTime = (user: DeviceUser) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActiveDate = new Date(user.lastActive);
    
    // If last active was today, return the actual study time for today
    if (lastActiveDate >= today) {
      // For simplicity, we'll use a portion of total study time based on recent activity
      // In a real app, you'd track daily study time separately
      const todayPortion = Math.min(user.studyTime, 4 * 60 * 60); // Max 4 hours today display
      return todayPortion; // Return in seconds
    }
    return 0;
  };

  const getCoinsFromStudyTime = (studySeconds: number) => {
    // 1 coin every 10 minutes (600 seconds)
    return Math.floor(studySeconds / 600);
  };

  const isCurrentUserActive = (user: DeviceUser) => {
    // Check if this is the current device and timer is active
    const currentUser = displayUsers.find(u => u.deviceId === user.deviceId);
    return currentUser && isTimerActive();
  };

  return (
    <div className="flex-1">
      <h2 className={`text-xl font-bold mb-4 text-center ${
        theme === 'light' ? 'text-black' : 'text-white'
      }`}>الترتيب</h2>
      <div className="h-96 overflow-y-auto border rounded-lg p-2">
        <div className="space-y-2">
          {displayUsers.length === 0 ? (
            <p className={`text-center py-8 ${
              theme === 'light' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              لا يوجد أجهزة بعد
            </p>
          ) : (
            displayUsers.map((user) => {
              const todaySeconds = getTodayStudyTime(user);
              const todayTimeFormatted = formatStudyTime(todaySeconds);
              const todayCoins = getCoinsFromStudyTime(todaySeconds);
              const userIsActive = isCurrentUserActive(user);
              
              return (
                <div
                  key={user.deviceId}
                  className={`p-3 border rounded-lg transition-all duration-300 ${
                    user.rank === 1
                      ? theme === 'light' 
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-yellow-600 bg-yellow-900/20'
                      : user.rank === 2
                      ? theme === 'light'
                        ? 'border-gray-400 bg-gray-50'
                        : 'border-gray-500 bg-gray-700/50'
                      : user.rank === 3
                      ? theme === 'light'
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-orange-600 bg-orange-900/20'
                      : theme === 'light'
                        ? 'border-gray-300 bg-white'
                        : 'border-gray-600 bg-black'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className={`font-bold text-lg w-6 ${
                        theme === 'light' ? 'text-black' : 'text-white'
                      }`}>{user.rank}</span>
                      <span className="text-lg">{user.avatar || '👤'}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${
                          theme === 'light' ? 'text-black' : 'text-white'
                        }`}>{user.name}</span>
                        {userIsActive && (
                          <span className={`px-2 py-1 text-xs rounded-full animate-pulse ${
                            theme === 'light'
                              ? 'bg-green-500 text-white'
                              : 'bg-green-600 text-white'
                          }`}>
                            نشط
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`font-bold ${
                      theme === 'light' ? 'text-black' : 'text-white'
                    }`}>{user.score}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`p-2 rounded ${
                      theme === 'light' ? 'bg-blue-50' : 'bg-blue-900/20'
                    }`}>
                      <div className={`font-semibold ${
                        theme === 'light' ? 'text-blue-700' : 'text-blue-300'
                      }`}>
                        {todayTimeFormatted}
                      </div>
                      <div className={
                        theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                      }>
                        اليوم
                      </div>
                    </div>
                    <div className={`p-2 rounded ${
                      theme === 'light' ? 'bg-yellow-50' : 'bg-yellow-900/20'
                    }`}>
                      <div className={`font-semibold ${
                        theme === 'light' ? 'text-yellow-700' : 'text-yellow-300'
                      }`}>
                        +{todayCoins} عملة
                      </div>
                      <div className={
                        theme === 'light' ? 'text-yellow-600' : 'text-yellow-400'
                      }>
                        اليوم
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
