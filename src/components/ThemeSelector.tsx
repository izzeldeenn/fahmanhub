'use client';

import { useState } from 'react';
import { useCustomTheme, getThemeClasses } from '@/contexts/CustomThemeContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  border: string;
}

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

export function ThemeSelector() {
  const { currentTheme, setTheme, availableThemes, createCustomTheme, updateThemeColors } = useCustomTheme();
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [customColors, setCustomColors] = useState<ThemeColors>({
    primary: '#84cc16',
    secondary: '#fbbf24',
    accent: '#166534',
    background: '#fef3c7',
    surface: '#fde68a',
    text: '#000000',
    border: '#fbbf24'
  });
  const [customThemeName, setCustomThemeName] = useState('');
  const [selectedBackground, setSelectedBackground] = useState('default');

  const handleColorChange = (colorType: keyof ThemeColors, value: string) => {
    setCustomColors(prev => ({ ...prev, [colorType]: value }));
  };

  const handleCreateCustomTheme = () => {
    if (customThemeName.trim()) {
      createCustomTheme(customThemeName.trim(), customColors);
      setShowCustomCreator(false);
      setCustomThemeName('');
      setCustomColors({
        primary: '#84cc16',
        secondary: '#fbbf24',
        accent: '#166534',
        background: '#fef3c7',
        surface: '#fde68a',
        text: '#000000',
        border: '#fbbf24'
      });
    }
  };

  const handleQuickColorUpdate = () => {
    updateThemeColors(customColors);
  };

  const handleBackgroundSelect = (backgroundId: string) => {
    setSelectedBackground(backgroundId);
    // Store in localStorage for global access
    localStorage.setItem('selectedBackground', backgroundId);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('backgroundChange', { detail: backgroundId }));
  };

  // Load background from localStorage on mount
  useState(() => {
    const savedBackground = localStorage.getItem('selectedBackground');
    if (savedBackground) {
      setSelectedBackground(savedBackground);
    }
  });

  const themeClasses = getThemeClasses(currentTheme, theme === 'dark');

  return (
    <div className={`p-6 rounded-2xl border-2 ${
      theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700'
    }`}>
      <h3 className={`text-xl font-bold mb-6 ${
        theme === 'light' ? 'text-gray-800' : 'text-gray-200'
      }`}>
        {language === 'ar' ? 'اختيار الثيم' : 'Theme Selection'}
      </h3>

      {/* Predefined Themes */}
      <div className="mb-8">
        <h4 className={`text-lg font-semibold mb-4 ${
          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
        }`}>
          {language === 'ar' ? 'الثيمات الجاهزة' : 'Predefined Themes'}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {availableThemes.map((themeOption) => (
            <button
              key={themeOption.name}
              onClick={() => setTheme(themeOption)}
              className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                currentTheme.name === themeOption.name
                  ? 'border-blue-500 shadow-lg'
                  : theme === 'light'
                  ? 'border-gray-300 hover:border-gray-400'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: themeOption.colors.primary }}
                />
                <div 
                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: themeOption.colors.secondary }}
                />
                <div 
                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: themeOption.colors.accent }}
                />
              </div>
              <div className={`text-sm font-medium ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                {themeOption.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Theme Creator */}
      <div className="mb-6">
        <button
          onClick={() => setShowCustomCreator(!showCustomCreator)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            theme === 'light'
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {showCustomCreator 
            ? (language === 'ar' ? 'إغلاق' : 'Close')
            : (language === 'ar' ? 'إنشاء ثيم مخصص' : 'Create Custom Theme')
          }
        </button>
      </div>

      {/* Background Selection */}
      <div className="mb-6">
        <h4 className={`text-lg font-semibold mb-4 ${
          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
        }`}>
          {language === 'ar' ? 'خلفية القسم الأيمن' : 'Right Section Background'}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {BACKGROUNDS.map((background) => (
            <button
              key={background.id}
              onClick={() => handleBackgroundSelect(background.id)}
              className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                selectedBackground === background.id
                  ? 'border-blue-500 shadow-lg'
                  : theme === 'light'
                  ? 'border-gray-300 hover:border-gray-400'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <div 
                className="w-full h-12 rounded mb-2"
                style={{ 
                  background: background.value,
                  border: background.value === 'transparent' ? '2px dashed #d1d5db' : 'none'
                }}
              />
              <div className={`text-sm font-medium ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                {background.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {showCustomCreator && (
        <div className={`p-4 rounded-xl border-2 ${
          theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-gray-800 border-gray-700'
        }`}>
          <h4 className={`text-lg font-semibold mb-4 ${
            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
          }`}>
            {language === 'ar' ? 'مصمم الألوان' : 'Color Designer'}
          </h4>

          {/* Theme Name */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              {language === 'ar' ? 'اسم الثيم' : 'Theme Name'}
            </label>
            <input
              type="text"
              value={customThemeName}
              onChange={(e) => setCustomThemeName(e.target.value)}
              placeholder={language === 'ar' ? 'أدخل اسم الثيم' : 'Enter theme name'}
              className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none ${
                theme === 'light'
                  ? 'border-gray-300 bg-white text-black focus:border-blue-500'
                  : 'border-gray-600 bg-black text-white focus:border-blue-400'
              }`}
            />
          </div>

          {/* Color Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {Object.entries(customColors).map(([key, value]) => (
              <div key={key}>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => handleColorChange(key as keyof ThemeColors, e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleColorChange(key as keyof ThemeColors, e.target.value)}
                    className={`flex-1 px-3 py-2 border-2 rounded-lg focus:outline-none ${
                      theme === 'light'
                        ? 'border-gray-300 bg-white text-black focus:border-blue-500'
                        : 'border-gray-600 bg-black text-white focus:border-blue-400'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleQuickColorUpdate}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'light'
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {language === 'ar' ? 'معاينة سريعة' : 'Quick Preview'}
            </button>
            <button
              onClick={handleCreateCustomTheme}
              disabled={!customThemeName.trim()}
              className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'light'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {language === 'ar' ? 'حفظ الثيم' : 'Save Theme'}
            </button>
          </div>
        </div>
      )}

      {/* Current Theme Preview */}
      <div className={`p-4 rounded-xl border-2 ${
        theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-gray-800 border-gray-700'
      }`}>
        <h4 className={`text-lg font-semibold mb-4 ${
          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
        }`}>
          {language === 'ar' ? 'الثيم الحالي' : 'Current Theme'}: {currentTheme.name}
        </h4>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {Object.entries(currentTheme.colors).map(([key, value]) => (
            <div key={key} className="text-center">
              <div 
                className="w-full h-12 rounded-lg border-2 border-gray-300 mb-1"
                style={{ backgroundColor: value }}
              />
              <div className={`text-xs ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {key}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
