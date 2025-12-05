-- ============================================================================
-- FESTIC-VIBEX UNIFIED PLATFORM - COMPLETE SUPABASE SCHEMA
-- ============================================================================
-- This schema supports both Vibex (micro-layer) and Festic (macro-layer)
-- Features: Cookie Score 2.0, Hyper-Local Ads, Safety Features, Social Graph
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geospatial queries

-- ============================================================================
-- CORE USER TABLES
-- ============================================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  bio TEXT DEFAULT '',
  branch TEXT DEFAULT 'Not set',
  year INTEGER DEFAULT 2025,
  expertise TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  cookie_score INTEGER DEFAULT 1500, -- ELO rating starts at 1500
  skill_scores JSONB DEFAULT '{}', -- { "Python": 1600, "CAD": 1400 }
  privacy TEXT DEFAULT 'public' CHECK (privacy IN ('public', 'friends', 'private')),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  session_count INTEGER DEFAULT 0, -- For K-factor calculation
  total_vouches_received INTEGER DEFAULT 0,
  total_vouches_given INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Friends table (bidirectional friendship)
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id) -- Ensures only one row per friendship
);

-- Friend requests
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id)
);

-- Custom tags for organizing friends
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  emoji TEXT DEFAULT '🏷️',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tag memberships (many-to-many)
CREATE TABLE IF NOT EXISTS tag_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tag_id, user_id)
);

-- ============================================================================
-- VIBEX LAYER - SESSIONS (Big 4: Vibe, Seek, Cookie, Borrow)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('vibe', 'seek', 'cookie', 'borrow')),
  emoji TEXT NOT NULL,
  event_time TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participants UUID[] DEFAULT '{}',
  participant_roles JSONB DEFAULT '{}', -- { "user_id": "seeking" | "offering" | "giver" }
  privacy TEXT DEFAULT 'public' CHECK (privacy IN ('public', 'private')),
  visible_to_tags UUID[] DEFAULT '{}', -- Array of tag IDs for private sessions
  
  -- Conditional fields
  skill_tag TEXT, -- For 'seek' and 'cookie'
  help_category TEXT, -- For 'seek': Academic, Project, Tech, General
  expected_outcome TEXT, -- For 'seek' and 'cookie'
  return_time TIMESTAMPTZ, -- For 'borrow'
  urgency TEXT CHECK (urgency IN ('Low', 'Medium', 'High')), -- For 'borrow'
  flow TEXT CHECK (flow IN ('seeking', 'offering')), -- For 'seek' and 'cookie'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session messages (chat within sessions)
CREATE TABLE IF NOT EXISTS session_messages (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COOKIE SCORE 2.0 SYSTEM
-- ============================================================================

-- Vouches (skill endorsements)
CREATE TABLE IF NOT EXISTS vouches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vouchee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
  skill TEXT NOT NULL,
  points INTEGER NOT NULL, -- Calculated with diminishing returns
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(voucher_id, vouchee_id, session_id, skill) -- One vouch per skill per session
);

-- Cookie Score history (for tracking rating changes)
CREATE TABLE IF NOT EXISTS cookie_score_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  old_rating INTEGER NOT NULL,
  new_rating INTEGER NOT NULL,
  session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
  vouches_received INTEGER DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  k_factor INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cookie Store rewards
CREATE TABLE IF NOT EXISTS cookie_rewards (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cost_points INTEGER NOT NULL,
  sponsor TEXT DEFAULT 'Festic',
  quantity_available INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reward redemptions
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_id INTEGER NOT NULL REFERENCES cookie_rewards(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'expired')),
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FESTIC LAYER - MACRO EVENTS
-- ============================================================================

-- University-wide events (fests, concerts, hackathons)
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  university TEXT NOT NULL,
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expected_footfall INTEGER DEFAULT 0,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  community_tag TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communities (clubs, organizations)
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  tag TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendors (event-based businesses)
CREATE TABLE IF NOT EXISTS vendors (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor applications for events
CREATE TABLE IF NOT EXISTS vendor_applications (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id, event_id)
);

-- ============================================================================
-- HYPER-LOCAL AD ENGINE
-- ============================================================================

-- Local businesses (permanent stores, cafes, etc.)
CREATE TABLE IF NOT EXISTS local_businesses (
  id SERIAL PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  phone TEXT,
  hours JSONB DEFAULT '{}', -- { "mon": "9am-9pm", "tue": "9am-9pm" }
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Glowing pins (map promotions)
CREATE TABLE IF NOT EXISTS glowing_pins (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES local_businesses(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  zone TEXT NOT NULL CHECK (zone IN ('gate', 'hostel', 'academic', 'peripheral')),
  price_paid INTEGER NOT NULL, -- in paisa (INR * 100)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flash deals (push notifications)
CREATE TABLE IF NOT EXISTS flash_deals (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES local_businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_text TEXT NOT NULL, -- e.g., "50% off Iced Tea"
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  radius_meters INTEGER NOT NULL,
  price_paid INTEGER NOT NULL, -- in paisa
  push_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MESSAGING SYSTEM
-- ============================================================================

-- Direct message conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id),
  CHECK (participant1_id < participant2_id)
);

-- Direct messages
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATIONS SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'session_invite',
    'friend_request_received',
    'friend_request_accepted',
    'session_join',
    'session_ending_soon',
    'tag_add',
    'ownership_transfer',
    'vouch_received'
  )),
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- User who triggered the notification
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SAFETY FEATURES
-- ============================================================================

-- Walk With Me safety tracking
CREATE TABLE IF NOT EXISTS walk_with_me_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shared_with UUID[] DEFAULT '{}', -- Array of friend UUIDs
  destination_lat DOUBLE PRECISION NOT NULL,
  destination_lng DOUBLE PRECISION NOT NULL,
  destination_name TEXT NOT NULL,
  current_lat DOUBLE PRECISION NOT NULL,
  current_lng DOUBLE PRECISION NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expected_arrival TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'alert')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profiles
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_cookie_score ON profiles(cookie_score DESC);

-- Sessions
CREATE INDEX idx_sessions_creator ON sessions(creator_id);
CREATE INDEX idx_sessions_type ON sessions(session_type);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_time ON sessions(event_time);
CREATE INDEX idx_sessions_location ON sessions(lat, lng);

-- Friendships
CREATE INDEX idx_friendships_user1 ON friendships(user1_id);
CREATE INDEX idx_friendships_user2 ON friendships(user2_id);

-- Friend requests
CREATE INDEX idx_friend_requests_to ON friend_requests(to_user_id);
CREATE INDEX idx_friend_requests_from ON friend_requests(from_user_id);

-- Vouches
CREATE INDEX idx_vouches_vouchee ON vouches(vouchee_id);
CREATE INDEX idx_vouches_voucher ON vouches(voucher_id);
CREATE INDEX idx_vouches_session ON vouches(session_id);

-- Notifications
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read);

-- Messages
CREATE INDEX idx_session_messages_session ON session_messages(session_id);
CREATE INDEX idx_direct_messages_conversation ON direct_messages(conversation_id);

-- Events
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_host ON events(host_id);

-- Local businesses
CREATE INDEX idx_local_businesses_location ON local_businesses(lat, lng);
CREATE INDEX idx_local_businesses_owner ON local_businesses(owner_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouches ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookie_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookie_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowing_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE flash_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE walk_with_me_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, own profile write
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Friendships: Users can view their own friendships
CREATE POLICY "Users can view own friendships" ON friendships
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create friendships" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can delete own friendships" ON friendships
  FOR DELETE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Friend requests: Users can view requests involving them
CREATE POLICY "Users can view own friend requests" ON friend_requests
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create friend requests" ON friend_requests
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update received requests" ON friend_requests
  FOR UPDATE USING (auth.uid() = to_user_id);

-- Sessions: Public sessions viewable by all, private by friends/tags
CREATE POLICY "Public sessions viewable by all" ON sessions
  FOR SELECT USING (
    privacy = 'public' OR 
    creator_id = auth.uid() OR 
    auth.uid() = ANY(participants)
  );

CREATE POLICY "Users can create sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own sessions" ON sessions
  FOR DELETE USING (auth.uid() = creator_id);

-- Session messages: Participants can view and send
CREATE POLICY "Participants can view session messages" ON session_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_messages.session_id 
      AND (sessions.creator_id = auth.uid() OR auth.uid() = ANY(sessions.participants))
    )
  );

CREATE POLICY "Participants can send messages" ON session_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_messages.session_id 
      AND (sessions.creator_id = auth.uid() OR auth.uid() = ANY(sessions.participants))
    )
  );

-- Vouches: Users can view vouches they gave or received
CREATE POLICY "Users can view own vouches" ON vouches
  FOR SELECT USING (auth.uid() = voucher_id OR auth.uid() = vouchee_id);

CREATE POLICY "Users can create vouches" ON vouches
  FOR INSERT WITH CHECK (auth.uid() = voucher_id);

-- Cookie rewards: Everyone can view active rewards
CREATE POLICY "Active rewards viewable by all" ON cookie_rewards
  FOR SELECT USING (is_active = true);

-- Reward redemptions: Users can view own redemptions
CREATE POLICY "Users can view own redemptions" ON reward_redemptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can redeem rewards" ON reward_redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Events: Public events viewable by all
CREATE POLICY "Public events viewable by all" ON events
  FOR SELECT USING (visibility = 'public' OR host_id = auth.uid());

CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update own events" ON events
  FOR UPDATE USING (auth.uid() = host_id);

-- Notifications: Users can view own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Direct messages: Participants can view and send
CREATE POLICY "Participants can view messages" ON direct_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = direct_messages.conversation_id 
      AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

CREATE POLICY "Participants can send messages" ON direct_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = direct_messages.conversation_id 
      AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_walk_with_me_updated_at BEFORE UPDATE ON walk_with_me_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-accept friend request and create friendship
CREATE OR REPLACE FUNCTION accept_friend_request()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO friendships (user1_id, user2_id)
    VALUES (
      LEAST(NEW.from_user_id, NEW.to_user_id),
      GREATEST(NEW.from_user_id, NEW.to_user_id)
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_friend_request_accepted AFTER UPDATE ON friend_requests
  FOR EACH ROW EXECUTE FUNCTION accept_friend_request();

-- Function to update session count when user participates
CREATE OR REPLACE FUNCTION update_session_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'closed' AND OLD.status = 'active' THEN
    -- Update creator
    UPDATE profiles 
    SET session_count = session_count + 1 
    WHERE id = NEW.creator_id;
    
    -- Update participants
    UPDATE profiles 
    SET session_count = session_count + 1 
    WHERE id = ANY(NEW.participants);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_session_closed AFTER UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_session_count();

-- ============================================================================
-- INITIAL DATA (Optional)
-- ============================================================================

-- Insert default cookie rewards
INSERT INTO cookie_rewards (title, description, cost_points, sponsor, quantity_available, is_active) VALUES
  ('Free Coffee', 'Redeem for a free coffee at campus cafe', 100, 'Campus Cafe', 50, true),
  ('Pizza Slice', 'Free slice of pizza at the food court', 150, 'Food Court', 30, true),
  ('Stationery Kit', 'Complete stationery kit for students', 300, 'Campus Store', 20, true),
  ('Movie Ticket', 'Free movie ticket at nearby cinema', 500, 'PVR Cinemas', 10, true),
  ('Fest Entry Pass', 'VIP entry to next campus fest', 1000, 'Festic', 5, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for user profiles with friend count
CREATE OR REPLACE VIEW user_profiles_with_stats AS
SELECT 
  p.*,
  (
    SELECT COUNT(*) 
    FROM friendships f 
    WHERE f.user1_id = p.id OR f.user2_id = p.id
  ) as friend_count,
  (
    SELECT COUNT(*) 
    FROM vouches v 
    WHERE v.vouchee_id = p.id
  ) as total_vouches
FROM profiles p;

-- View for active sessions with creator info
CREATE OR REPLACE VIEW active_sessions_with_creator AS
SELECT 
  s.*,
  p.username as creator_username,
  p.cookie_score as creator_cookie_score
FROM sessions s
JOIN profiles p ON s.creator_id = p.id
WHERE s.status = 'active';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- Schema created successfully!
-- Next steps:
-- 1. Run this schema in your Supabase SQL Editor
-- 2. Update your .env.local with new Supabase credentials
-- 3. Deploy to Vercel
-- 4. Test the application

SELECT 'Festic-Vibex Unified Schema Created Successfully! 🎉' as message;
