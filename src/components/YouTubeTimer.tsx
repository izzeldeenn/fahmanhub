'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';

export function YouTubeTimer() {
  const { theme } = useTheme();
  const { getCurrentDeviceUser, updateDeviceStudyTime, setTimerActive } = useUser();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const studyTimeRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Extract video ID from YouTube URL
  const getVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Get embed URL from video ID
  const getEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
  };

  useEffect(() => {
    if (isRunning) {
      setTimerActive(true);
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
      
      // Update device study time every second
      studyTimeRef.current = setInterval(() => {
        updateDeviceStudyTime(1); // Add 1 second of study time
      }, 1000);
    } else {
      setTimerActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (studyTimeRef.current) {
        clearInterval(studyTimeRef.current);
      }
    }

    return () => {
      setTimerActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (studyTimeRef.current) {
        clearInterval(studyTimeRef.current);
      }
    };
  }, [isRunning, updateDeviceStudyTime, setTimerActive]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (videoUrl && getVideoId(videoUrl)) {
      setIsRunning(true);
      setShowVideo(true);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setShowVideo(false);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
    setShowVideo(false);
  };

  const videoId = videoUrl ? getVideoId(videoUrl) : null;
  const embedUrl = videoId ? getEmbedUrl(videoId) : '';

  return (
    <div className="text-center">
      <h1 className={`text-6xl font-bold mb-8 font-mono ${
        theme === 'light' ? 'text-black' : 'text-white'
      }`}>
        {formatTime(time)}
      </h1>

      {/* YouTube URL Input */}
      <div className="mb-6">
        <input
          type="text"
          value={videoUrl}
          onChange={handleUrlChange}
          placeholder="أدخل رابط فيديو يوتيوب..."
          className={`w-full max-w-md px-4 py-2 border-2 rounded-lg text-right ${
            theme === 'light'
              ? 'border-gray-300 bg-white text-black placeholder-gray-500'
              : 'border-gray-600 bg-black text-white placeholder-gray-400'
          }`}
        />
        {videoUrl && !videoId && (
          <p className={`text-sm mt-2 ${
            theme === 'light' ? 'text-red-600' : 'text-red-400'
          }`}>
            رابط يوتيوب غير صحيح
          </p>
        )}
      </div>

      {/* Video Display */}
      {showVideo && videoId && (
        <div className="mb-6">
          <div className="relative w-full max-w-3xl mx-auto">
            <iframe
              ref={iframeRef}
              width="100%"
              height="480"
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="space-x-4">
        <button
          onClick={handleStart}
          disabled={isRunning || !videoId}
          className={`px-8 py-3 border-2 rounded-lg font-semibold transition-colors ${
            theme === 'light'
              ? 'border-black bg-white text-black hover:bg-black hover:text-white disabled:bg-gray-100 disabled:border-gray-400 disabled:text-gray-400'
              : 'border-white bg-black text-white hover:bg-white hover:text-black disabled:bg-gray-900 disabled:border-gray-700 disabled:text-gray-700'
          } disabled:cursor-not-allowed`}
        >
          بدء
        </button>
        <button
          onClick={handleStop}
          disabled={!isRunning}
          className={`px-8 py-3 border-2 rounded-lg font-semibold transition-colors ${
            theme === 'light'
              ? 'border-black bg-white text-black hover:bg-black hover:text-white disabled:bg-gray-100 disabled:border-gray-400 disabled:text-gray-400'
              : 'border-white bg-black text-white hover:bg-white hover:text-black disabled:bg-gray-900 disabled:border-gray-700 disabled:text-gray-700'
          } disabled:cursor-not-allowed`}
        >
          إيقاف
        </button>
        <button
          onClick={handleReset}
          className={`px-8 py-3 border-2 rounded-lg font-semibold transition-colors ${
            theme === 'light'
              ? 'border-black bg-white text-black hover:bg-black hover:text-white'
              : 'border-white bg-black text-white hover:bg-white hover:text-black'
          }`}
        >
          إعادة تعيين
        </button>
      </div>
    </div>
  );
}
