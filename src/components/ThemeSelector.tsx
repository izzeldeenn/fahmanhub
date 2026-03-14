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
   // Focus-friendly commercial backgrounds
  { id: 'focus1', name: 'غابة مركزة', value: 'url("https://images.unsplash.com/photo-1540206395-68808572332f?w=1920&h=1080&fit=crop&crop=entropy&cs=tinysrgb")' },
  { id: 'focus2', name: 'مكتبة هادئة', value: 'url("https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1920&h=1080&fit=crop&crop=entropy&cs=tinysrgb")' },
  { id: 'focus3', name: 'سماء صافية', value: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=entropy&cs=tinysrgb")' },
  { id: 'focus4', name: 'طبيعة calm', value: 'url("https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&h=1080&fit=crop&crop=entropy&cs=tinysrgb")' },
  { id: 'focus5', name: 'محيط طبيعي', value: 'url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop&crop=entropy&cs=tinysrgb")' },
  // Animated focus backgrounds
  { id: 'animated1', name: 'غيوم متحرك', value: 'url("https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3YzYyaWJyMXQ0YWtyYzFyZWVvdDFha3M1bWFkeTg0c3F6YmszeWYwdSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/SjkNtYAuV4OXbRIGEc/giphy.gif")' },
  { id: 'animated2', name: 'مطر متحركة', value: 'url("https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3YzYyaWJyMXQ0YWtyYzFyZWVvdDFha3M1bWFkeTg0c3F6YmszeWYwdSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/LlDxkLadoRcmlcMbP8/giphy.gif")' },
  { id: 'animated3', name: 'نجوم ساقطة', value: 'url("https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Y2Z3eTNmdm5qcjY0enNhdWwwbjY5aDFiZ2tzc3AycjM3MG5ma3VucSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/jDl06sVsg4WVrCEJtS/giphy.gif")' },
  { id: 'animated4', name: 'موجات متحركة', value: 'url("https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Y2Z3eTNmdm5qcjY0enNhdWwwbjY5aDFiZ2tzc3AycjM3MG5ma3VucSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/j3OL6mSc2FeV0UHMDg/giphy.gif")' },
  { id: 'animated5', name: 'غيوم لطيف', value: 'url("https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Y2Z3eTNmdm5qcjY0enNhdWwwbjY5aDFiZ2tzc3AycjM3MG5ma3VucSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/LXxWO0pgGEma8W40A9/giphy.gif")' },
  // Additional animated backgrounds
  { id: 'animated6', name: 'غابة متحركة', value: 'url("https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3YzYyaWJyMXQ0YWtyYzFyZWVvdDFha3M1bWFkeTg0c3F6YmszeWYwdSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/SjkNtYAuV4OXbRIGEc/giphy.gif")' },
  { id: 'animated7', name: 'مطر هادئ', value: 'url("https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3YzYyaWJyMXQ0YWtyYzFyZWVvdDFha3M1bWFkeTg0c3F6YmszeWYwdSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/LlDxkLadoRcmlcMbP8/giphy.gif")' },
  { id: 'animated8', name: 'نجوم لامعة', value: 'url("https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Y2Z3eTNmdm5qcjY0enNhdWwwbjY5aDFiZ2tzc3AycjM3MG5ma3VucSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/jDl06sVsg4WVrCEJtS/giphy.gif")' },
  { id: 'animated9', name: 'أمواج هادئة', value: 'url("https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Y2Z3eTNmdm5qcjY0enNhdWwwbjY5aDFiZ2tzc3AycjM3MG5ma3VucSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/j3OL6mSc2FeV0UHMDg/giphy.gif")' },
  { id: 'animated10', name: 'غيوم ناعمة', value: 'url("https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Y2Z3eTNmdm5qcjY0enNhdWwwbjY5aDFiZ2tzc3AycjM3MG5ma3VucSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/LXxWO0pgGEma8W40A9/giphy.gif")' }
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
        
        {/* Background Categories */}
        <div className="space-y-4">
          {/* Basic Backgrounds */}
          <div>
            <h5 className={`text-sm font-medium mb-2 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {language === 'ar' ? 'أساسية' : 'Basic'}
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {BACKGROUNDS.filter(bg => ['default', 'gradient1', 'gradient2', 'gradient3', 'gradient4', 'gradient5', 'pattern1', 'pattern2'].includes(bg.id)).map((background) => (
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
                  <div className={`text-xs font-medium ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    {background.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Focus Images */}
          <div>
            <h5 className={`text-sm font-medium mb-2 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {language === 'ar' ? 'صور للتركيز' : 'Focus Images'}
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {BACKGROUNDS.filter(bg => ['focus1', 'focus2', 'focus3', 'focus4', 'focus5'].includes(bg.id)).map((background) => (
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
                    className="w-full h-12 rounded mb-2 bg-cover bg-center"
                    style={{ 
                      backgroundImage: background.value,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className={`text-xs font-medium ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    {background.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Animated Backgrounds */}
          <div>
            <h5 className={`text-sm font-medium mb-2 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {language === 'ar' ? 'خلفيات متحركة' : 'Animated'}
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {BACKGROUNDS.filter(bg => ['animated1', 'animated2', 'animated3', 'animated4', 'animated5', 'animated6', 'animated7', 'animated8', 'animated9', 'animated10'].includes(bg.id)).map((background) => (
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
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className={`text-xs font-medium ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    {background.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
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
