-- Create devices table for real-time device rankings
CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  score INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 1,
  study_time INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_info JSONB
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_devices_score ON devices(score DESC);
CREATE INDEX IF NOT EXISTS idx_devices_rank ON devices(rank ASC);
CREATE INDEX IF NOT EXISTS idx_devices_last_active ON devices(last_active DESC);

-- Insert demo devices
INSERT INTO devices (id, name, avatar, score, rank, study_time, created_at, last_active) VALUES
  ('demo-1', 'جهاز احمد', '💻', 850, 1, 7200, NOW(), NOW()),
  ('demo-2', 'جهاز محمد', '📱', 650, 2, 5400, NOW() - INTERVAL '30 minutes', NOW()),
  ('demo-3', 'جهاز فاطمة', '🎮', 420, 3, 3600, NOW() - INTERVAL '1 hour', NOW());
