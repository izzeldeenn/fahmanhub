'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Logo } from '@/components/Logo';
import { UserRankings } from '@/components/UserRankings';
import { CurrentUserSelector } from '@/components/CurrentUserSelector';
import { SettingsButton } from '@/components/SettingsButton';
import { TimerSelector } from '@/components/TimerSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserProfile } from '@/components/UserProfile';
import { FullscreenPrompt } from '@/components/FullscreenPrompt';
import { FullscreenProvider } from '@/contexts/FullscreenContext';
import { CustomThemeProvider } from '@/contexts/CustomThemeContext';
import { ThemeSelector } from '@/components/ThemeSelector';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { useUser } from '@/contexts/UserContext';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const BACKGROUNDS = [
  { id: 'default', name: 'افتراضي', value: 'transparent' },
  { id: 'gradient1', name: 'تدرج أخضر', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient2', name: 'تدرج أزرق', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'gradient3', name: 'تدرج برتقالي', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 'gradient4', name: 'تدرج بنفسجي', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { id: 'gradient5', name: 'تدرج رمادي', value: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' },
  { id: 'pattern1', name: 'نقوش', value: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' },
  { id: 'pattern2', name: 'خطوط', value: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%239C92AC" fill-opacity="0.1" fill-rule="evenodd"/%3E%3C/svg%3E")' }
];

function HomeContent() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { setTimerActive } = useUser();
  const customTheme = useCustomThemeClasses();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState('default');

  useEffect(() => {
    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // User exited fullscreen, stop timer
        setTimerActive(false);
      }
    };

    // Listen for background changes
    const handleBackgroundChange = (event: CustomEvent) => {
      setSelectedBackground(event.detail);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    window.addEventListener('backgroundChange', handleBackgroundChange as EventListener);

    // Load saved background
    const savedBackground = localStorage.getItem('selectedBackground');
    if (savedBackground) {
      setSelectedBackground(savedBackground);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      window.removeEventListener('backgroundChange', handleBackgroundChange as EventListener);
    };
  }, [setTimerActive]);

  return (
    <>
    <div className={`flex h-screen overflow-hidden ${
      theme === 'light' ? 'bg-white' : 'bg-black'
    }`}>
      <FullscreenPrompt />

      {/* Desktop Layout - Side by side */}
      <div className="hidden md:flex w-full h-full">
        {/* Left section - 1/4 width */}
        <div 
          className="w-1/4 p-6 flex flex-col h-full overflow-y-auto"
          style={{
            backgroundColor: customTheme.colors.surface,
            borderLeft: `2px solid ${customTheme.colors.border}`
          }}
        >
          <div className="flex justify-between items-start mb-6 flex-shrink-0">
            <Logo />
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowThemeSelector(true)}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: customTheme.colors.text
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = customTheme.colors.primary;
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = customTheme.colors.text;
                }}
                title={language === 'ar' ? 'تخصيص الثيم' : 'Customize Theme'}
              >
                🎨
              </button>
              <SettingsButton />
            </div>
          </div>
          <CurrentUserSelector />
          <UserRankings />
        </div>
        
        {/* Right section - 3/4 width */}
        <div 
          className="w-3/4 flex items-center justify-center p-8 relative h-full overflow-hidden"
          style={{
            background: BACKGROUNDS.find(bg => bg.id === selectedBackground)?.value || 'transparent'
          }}
        >
          <div className="absolute top-4 left-4 flex items-center space-x-2 space-x-reverse z-[9998] flex-shrink-0">
            {selectedBackground !== 'default' && (
              <div className="text-xs bg-black/50 text-white px-2 py-1 rounded">
                {BACKGROUNDS.find(bg => bg.id === selectedBackground)?.name}
              </div>
            )}
          </div>
          <TimerSelector />
        </div>
      </div>

      {/* Mobile Layout - Vertical */}
      <div className="md:hidden flex flex-col w-full h-screen overflow-hidden">
        {/* Mobile Header */}
        <div 
          className="flex justify-between items-center p-4 border-b sticky top-0 z-10 flex-shrink-0"
          style={{
            backgroundColor: customTheme.colors.surface,
            borderColor: customTheme.colors.border
          }}
        >
          <Logo />
          <div className="flex items-center space-x-1 space-x-reverse">
            <UserProfile />
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Timer Section - Takes most space */}
          <div 
            className="flex-1 flex items-center justify-center p-4 min-h-[60vh] flex-shrink-0 relative"
            style={{
              background: BACKGROUNDS.find(bg => bg.id === selectedBackground)?.value || 'transparent'
            }}
          >
            {selectedBackground !== 'default' && (
              <div className="absolute top-2 right-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
                {BACKGROUNDS.find(bg => bg.id === selectedBackground)?.name}
              </div>
            )}
            <TimerSelector />
          </div>

          {/* User Section - Bottom */}
          <div 
            className="p-4 border-t flex-shrink-0"
            style={{
              backgroundColor: customTheme.colors.surface,
              borderColor: customTheme.colors.border
            }}
          >
            <CurrentUserSelector />
            <div className="mt-4">
              <UserRankings />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Theme Selector Modal */}
    {showThemeSelector && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl">
          <div className={`p-6 border-b ${
            theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-2xl font-bold ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-200'
              }`}>
                {language === 'ar' ? 'تخصيص الثيم' : 'Theme Customization'}
              </h3>
              <button
                onClick={() => setShowThemeSelector(false)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  theme === 'light'
                    ? 'hover:bg-gray-100 text-gray-600'
                    : 'hover:bg-gray-800 text-gray-400'
                }`}
              >
                ✕
              </button>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            <ThemeSelector />
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default function Home() {
  return (
    <CustomThemeProvider>
      <FullscreenProvider>
        <HomeContent />
      </FullscreenProvider>
    </CustomThemeProvider>
  );
}
