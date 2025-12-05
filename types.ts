// This is the new, complete types file for our app.

/**
 * Represents the user's public-facing profile.
 * This will be an extension of the data in the Supabase 'profiles' table.
 */
export interface Profile {
  username: string;
  bio: string;
  // New fields from our plan:
  branch: string;
  year: number;
  expertise: string[]; // e.g., ["Python", "CAD"]
  interests: string[]; // e.g., ["Chess", "Football"]
  cookieScore: number; // Our new "Cookie Score"
  privacy: 'public' | 'friends' | 'private';
  // NEW: Fields for Cookie Score dashboard
  skillScores: { [key: string]: number };
  vouchHistory: Vouch[];
}

/**
 * This is our app's main user object, combining Supabase auth
 * and our public profile.
 */
export interface User {
  id: string; // from supabase.auth.user
  email?: string; // from supabase.auth.user
  profile: Profile;
}

/**
 * Defines the "Big 4" session types.
 * Vibe: Social gathering
 * Seek: Asking for help
 * Cookie: Offering a skill
 * Borrow: Item exchange
 */
export type SessionType = 'vibe' | 'seek' | 'cookie' | 'borrow';

/**
 * This is the new core data structure, replacing the old 'Event'.
 * It represents any of our "Big 4" sessions.
 */
export interface Session {
  id: number;
  title: string;
  description: string;
  lat: number;
  lng: number;
  sessionType: SessionType;
  emoji: string; // The emoji used as the map marker

  // Time & Status
  event_time: string; // ISO String for the event start time
  duration: number; // Duration in minutes
  status: 'active' | 'closed';

  // User & Social
  creator_id: string;
  participants: string[]; // Array of user UUIDs
  creator: { username: string }; // Joined from profiles table

  // Conditional Fields
  returnTime?: string; // ISO string (for 'borrow')
  flow?: 'seeking' | 'offering'; // (for 'seek' and 'cookie')

  // Privacy fields for private vibes
  privacy: 'public' | 'private';
  visibleToTags?: string[]; // Array of tag IDs

  // NEW: Fields for Seek & Cookie flows
  helpCategory?: 'Academic' | 'Project' | 'Tech' | 'General';
  skillTag?: string; // e.g., "Python"
  expectedOutcome?: string;
  // UPDATED: 'giver' role added for Borrow system
  participantRoles?: { [userId: string]: 'seeking' | 'offering' | 'giver' };

  // NEW: Field for Borrow system
  urgency?: 'Low' | 'Medium' | 'High';
}

/**
 * Represents a chat message within a Session.
 * This replaces the old 'VibeMessage'.
 */
export interface SessionMessage {
  id: number;
  sender_id: string;
  session_id: number; // Renamed from event_id
  text: string;
  created_at: string;
  sender: { username: string }; // Joined from profiles table
}

/**
 * NEW: Represents a user in the friends list.
 */
export interface Friend {
  id: string;
  username: string;
  branch: string;
  year: number;
  cookieScore: number;
  mutualFriends: number;
}

/**
 * NEW: Represents a custom tag for organizing friends.
 */
export interface Tag {
  id: string;
  name: string;
  color: string;
  emoji: string;
  memberIds: string[];
  creator_id: string;
}

/**
 * NEW: Represents a friend request between two users.
 */
export interface FriendRequest {
  id: string; // The request's UUID from Supabase
  fromUserId: string;
  toUserId: string;
}

/**
 * NEW: Represents a single direct message between users.
 */
export interface DirectMessage {
  id: string;
  conversation_id: string; // Foreign key to the conversation
  senderId: string;
  text: string;
  timestamp: string; // ISO String
}

/**
 * NEW: Represents a conversation thread between two users.
 */
export interface Conversation {
  id: string;
  participantIds: string[];
  messages: DirectMessage[];
  unreadCount: number;
}

/**
 * NEW: Defines the types of notifications in the app.
 */
export type NotificationType =
  | 'session_invite'
  | 'friend_request_received'
  | 'friend_request_accepted'
  | 'session_join'
  | 'session_ending_soon'
  | 'tag_add'
  | 'ownership_transfer'; // NEW

/**
 * NEW: Represents a single notification item.
 */
export interface Notification {
  id: string;
  type: NotificationType;
  user?: { id: string; username: string }; // User who triggered the notification (actor)
  session?: { id: number; title: string; emoji: string }; // Related session
  tag?: { id: string; name: string }; // Related tag
  timestamp: string; // ISO String
  isRead: boolean;
}

/**
 * NEW: Represents a vouch given from one user to another for a skill.
 */
export interface Vouch {
  id: string;
  voucherUsername: string;
  skill: string;
  points: number;
  timestamp: string; // ISO String
}


// We are removing the old 'Note' and 'Topic' types as they are no longer needed.

// ============================================================================
// FESTIC LAYER TYPES (Macro Events)
// ============================================================================

/**
 * Represents a university-wide event (fest, concert, hackathon).
 * This is the "macro" layer of the dual-layer architecture.
 */
export interface Event {
  id: number;
  name: string;
  description: string;
  date: string; // ISO String
  university: string;
  host_id: string; // UUID of the host user
  expected_footfall: number;
  image_url: string;
  tags: string[];
  community_tag: string;
  visibility: 'public' | 'private';
  created_at: string;
}

/**
 * Represents a vendor (food truck, performer) applying for fest stalls.
 * Different from LocalBusiness (permanent stores).
 */
export interface Vendor {
  id: number;
  user_id: string;
  business_name: string;
  category: string;
  description: string;
  image_url: string;
  subscription_tier: 'free' | 'basic' | 'premium';
  created_at: string;
}

/**
 * Represents a vendor application to participate in an event.
 */
export interface VendorApplication {
  id: number;
  vendor_id: number;
  event_id: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

/**
 * Represents a community or club on campus.
 */
export interface Community {
  id: string;
  name: string;
  image_url: string;
  tag: string;
}

/**
 * User roles for Festic layer.
 */
export type FesticRole = 'host' | 'vendor' | 'student';

/**
 * Team types for event management.
 */
export type TeamType = 'media' | 'vendor_management' | 'logistics' | 'security' | 'hospitality' | 'technical';

// ============================================================================
// HYPER-LOCAL AD ENGINE TYPES
// ============================================================================

/**
 * Represents a permanent local business (cafe, stationery, etc.).
 * Different from Vendor (event-based).
 */
export interface LocalBusiness {
  id: number;
  owner_id: string;
  name: string;
  category: string;
  description: string;
  lat: number;
  lng: number;
  phone: string;
  hours: { [day: string]: string }; // e.g., { "mon": "9am-9pm" }
  logo_url: string;
  is_verified: boolean;
  created_at: string;
}

/**
 * Represents an active glowing pin promotion on the map.
 */
export interface GlowingPin {
  id: number;
  business_id: number;
  business?: LocalBusiness; // Joined from local_businesses table
  start_time: string;
  end_time: string;
  zone: 'gate' | 'hostel' | 'academic' | 'peripheral';
  price_paid: number; // in paisa (INR * 100)
  is_active: boolean;
  created_at: string;
}

/**
 * Represents a flash deal push notification.
 */
export interface FlashDeal {
  id: number;
  business_id: number;
  business?: LocalBusiness;
  title: string;
  description: string;
  discount_text: string; // e.g., "50% off Iced Tea"
  start_time: string;
  end_time: string;
  radius_meters: number;
  price_paid: number;
  push_sent: boolean;
  created_at: string;
}

// ============================================================================
// COOKIE SCORE 2.0 TYPES
// ============================================================================

/**
 * Represents a reward in the Cookie Store.
 */
export interface CookieReward {
  id: number;
  title: string;
  description: string;
  cost_points: number;
  sponsor: string;
  quantity_available: number;
  is_active: boolean;
}

/**
 * Represents a reward redemption by a user.
 */
export interface RewardRedemption {
  id: number;
  user_id: string;
  reward_id: number;
  reward?: CookieReward;
  redeemed_at: string;
  status: 'pending' | 'claimed' | 'expired';
}

/**
 * Cookie Score rating tiers.
 */
export type CookieTier = 'newbie' | 'contributor' | 'specialist' | 'expert' | 'master' | 'grandmaster';

/**
 * Cookie Score tier information.
 */
export interface CookieTierInfo {
  name: string;
  minRating: number;
  color: string;
  bgColor: string;
}

// ============================================================================
// SAFETY FEATURES
// ============================================================================

/**
 * Represents a Walk With Me safety tracking session.
 */
export interface WalkWithMeSession {
  id: string;
  user_id: string;
  shared_with: string[]; // Array of friend UUIDs
  destination_lat: number;
  destination_lng: number;
  destination_name: string;
  current_lat: number;
  current_lng: number;
  started_at: string;
  expected_arrival: string;
  status: 'active' | 'completed' | 'alert';
  updated_at: string;
}

// ============================================================================
// APP LAYER TYPE
// ============================================================================

/**
 * Defines which layer of the app is currently active.
 */
export type AppLayer = 'vibex' | 'festic';