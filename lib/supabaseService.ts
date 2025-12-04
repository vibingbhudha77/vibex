// lib/supabaseService.ts - PRODUCTION READY VERSION
// ============================================
// This file provides all database operations for VibexX
// Designed to work seamlessly with the production backend SQL
// ============================================

import { supabase } from './supabaseClient';
import type {
  Session,
  SessionMessage,
  Friend,
  Tag,
  FriendRequest,
  Notification,
  Profile,
  Conversation,
  DirectMessage,
  Vouch,
} from '../types';

// ============================================
// TYPE DEFINITIONS FOR DATABASE RESPONSES
// ============================================

interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

interface RpcResponse {
  success: boolean;
  error?: string;
  error_code?: string;
  [key: string]: any;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generic response handler for Supabase queries
 */
async function handleResponse<T>(
  promise: PromiseLike<{ data: T | null; error: any }>
): Promise<ServiceResponse<T>> {
  try {
    const { data, error } = await promise;
    if (error) {
      console.error('Supabase API Error:', error.message || error);
      return { data: null, error: new Error(error.message || 'Database error') };
    }
    return { data, error: null };
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return { data: null, error: new Error(error.message || 'Unexpected error') };
  }
}

/**
 * Maps database session record to frontend Session type
 */
function mapSessionFromDB(record: any): Session {
  return {
    id: record.id,
    title: record.title,
    description: record.description || '',
    lat: record.lat,
    lng: record.lng,
    sessionType: record.session_type,
    emoji: record.emoji,
    event_time: record.event_time,
    duration: record.duration,
    status: record.status,
    creator_id: record.creator_id,
    participants: record.participants || [],
    participantRoles: record.participant_roles || {},
    privacy: record.privacy,
    visibleToTags: record.visible_to_tags || [],
    helpCategory: record.help_category,
    skillTag: record.skill_tag,
    expectedOutcome: record.expected_outcome,
    returnTime: record.return_time,
    urgency: record.urgency,
    flow: record.flow,
    creator: record.creator || { username: 'Unknown' },
  };
}

/**
 * Maps frontend session data to database format
 */
function mapSessionToDB(sessionData: any): any {
  return {
    title: sessionData.title,
    description: sessionData.description || '',
    lat: sessionData.lat,
    lng: sessionData.lng,
    session_type: sessionData.sessionType,
    emoji: sessionData.emoji,
    event_time: sessionData.event_time,
    duration: sessionData.duration,
    status: sessionData.status || 'active',
    creator_id: sessionData.creator_id,
    participants: sessionData.participants || [],
    participant_roles: sessionData.participantRoles || {},
    privacy: sessionData.privacy || 'public',
    visible_to_tags: sessionData.visibleToTags || [],
    help_category: sessionData.helpCategory || null,
    skill_tag: sessionData.skillTag || null,
    expected_outcome: sessionData.expectedOutcome || null,
    return_time: sessionData.returnTime || null,
    urgency: sessionData.urgency || null,
    flow: sessionData.flow || null,
  };
}

/**
 * Maps database friend request to frontend format
 */
function mapFriendRequestFromDB(record: any): FriendRequest {
  return {
    id: record.id,
    fromUserId: record.from_user_id,
    toUserId: record.to_user_id,
  };
}

/**
 * Maps database tag to frontend format
 */
function mapTagFromDB(record: any): Tag {
  return {
    id: record.id,
    name: record.name,
    color: record.color,
    emoji: record.emoji,
    memberIds: record.member_ids || [],
    creator_id: record.creator_id,
  };
}

/**
 * Maps database profile to frontend Friend format
 */
function mapProfileToFriend(record: any): Friend {
  return {
    id: record.id,
    username: record.username,
    branch: record.branch || 'Not set',
    year: record.year || 2025,
    cookieScore: record.cookie_score || 0,
    mutualFriends: 0, // Calculated separately if needed
  };
}

/**
 * Maps database direct message to frontend format
 */
function mapDirectMessageFromDB(record: any): DirectMessage {
  return {
    id: record.id,
    conversation_id: record.conversation_id,
    senderId: record.sender_id,
    text: record.text,
    timestamp: record.timestamp,
  };
}

/**
 * Maps database vouch to frontend format
 */
function mapVouchFromDB(record: any): Vouch {
  return {
    id: record.vouch_id || record.id,
    voucherUsername: record.voucher_username || 'Unknown',
    skill: record.skill_name || record.skill,
    points: record.points_earned || record.points,
    timestamp: record.created_timestamp || record.created_at,
  };
}


// ============================================
// SESSIONS
// ============================================

/**
 * Fetch all active sessions with creator info
 */
export const fetchActiveSessions = async (): Promise<ServiceResponse<Session[]>> => {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      creator:profiles!creator_id(username)
    `)
    .eq('status', 'active')
    .order('event_time', { ascending: false });

  if (error) {
    console.error('Error fetching active sessions:', error);
    return { data: null, error: new Error(error.message) };
  }

  return {
    data: data ? data.map(mapSessionFromDB) : [],
    error: null,
  };
};

/**
 * Create a new session
 */
export const createSession = async (sessionData: any): Promise<ServiceResponse<Session[]>> => {
  const dbData = mapSessionToDB(sessionData);

  const { data, error } = await supabase
    .from('sessions')
    .insert([dbData])
    .select(`
      *,
      creator:profiles!creator_id(username)
    `);

  if (error) {
    console.error('Error creating session:', error);
    return { data: null, error: new Error(error.message) };
  }

  return {
    data: data ? data.map(mapSessionFromDB) : null,
    error: null,
  };
};

/**
 * Update a session
 */
export const updateSession = async (
  sessionId: number,
  updates: Partial<any>
): Promise<ServiceResponse<Session[]>> => {
  const dbUpdates: any = {};
  
  if (updates.participants !== undefined) dbUpdates.participants = updates.participants;
  if (updates.participantRoles !== undefined) dbUpdates.participant_roles = updates.participantRoles;
  if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.creator_id !== undefined) dbUpdates.creator_id = updates.creator_id;

  const { data, error } = await supabase
    .from('sessions')
    .update(dbUpdates)
    .eq('id', sessionId)
    .select(`
      *,
      creator:profiles!creator_id(username)
    `);

  if (error) {
    console.error('Error updating session:', error);
    return { data: null, error: new Error(error.message) };
  }

  return {
    data: data ? data.map(mapSessionFromDB) : null,
    error: null,
  };
};

/**
 * Delete/close a session
 */
export const deleteSession = async (sessionId: number): Promise<ServiceResponse<any>> => {
  return handleResponse(
    supabase.from('sessions').delete().eq('id', sessionId)
  );
};

/**
 * Join a session using the safe RPC function
 */
export const joinSession = async (
  sessionId: number,
  userId: string,
  role: 'seeking' | 'offering' | 'participant' | 'giver' = 'participant'
): Promise<ServiceResponse<{ participants: string[]; participant_roles: any }[]>> => {
  try {
    const { data, error } = await supabase.rpc('join_session_safe', {
      p_session_id: sessionId,
      p_user_id: userId,
      p_role: role,
    });

    if (error) {
      console.error('Error joining session (RPC):', error);
      return { data: null, error: new Error(error.message) };
    }

    const rpcResponse = data as RpcResponse;
    
    if (!rpcResponse.success) {
      return {
        data: null,
        error: new Error(rpcResponse.error || 'Failed to join session'),
      };
    }

    return {
      data: [{
        participants: rpcResponse.participants,
        participant_roles: rpcResponse.participant_roles,
      }],
      error: null,
    };
  } catch (e: any) {
    console.error('Unexpected error in joinSession:', e);
    return { data: null, error: new Error(e.message || 'Unexpected error') };
  }
};

/**
 * Leave a session using the safe RPC function
 */
export const leaveSession = async (
  sessionId: number,
  userId: string
): Promise<ServiceResponse<RpcResponse>> => {
  try {
    const { data, error } = await supabase.rpc('leave_session_safe', {
      p_session_id: sessionId,
      p_user_id: userId,
    });

    if (error) {
      console.error('Error leaving session (RPC):', error);
      return { data: null, error: new Error(error.message) };
    }

    const rpcResponse = data as RpcResponse;
    
    if (!rpcResponse.success) {
      return {
        data: null,
        error: new Error(rpcResponse.error || 'Failed to leave session'),
      };
    }

    return { data: rpcResponse, error: null };
  } catch (e: any) {
    console.error('Unexpected error in leaveSession:', e);
    return { data: null, error: new Error(e.message || 'Unexpected error') };
  }
};


// ============================================
// VOUCHING / COOKIE SCORE
// ============================================

/**
 * Create a vouch using the safe RPC function
 */
export const createVouch = async (
  voucherId: string,
  receiverId: string,
  sessionId: number,
  skill: string
): Promise<ServiceResponse<RpcResponse>> => {
  try {
    const { data, error } = await supabase.rpc('create_vouch_safe', {
      p_voucher_id: voucherId,
      p_receiver_id: receiverId,
      p_session_id: sessionId,
      p_skill: skill,
    });

    if (error) {
      console.error('Error creating vouch (RPC):', error);
      return { data: null, error: new Error(error.message) };
    }

    const rpcResponse = data as RpcResponse;
    
    if (!rpcResponse.success) {
      return {
        data: null,
        error: new Error(rpcResponse.error || 'Failed to create vouch'),
      };
    }

    return { data: rpcResponse, error: null };
  } catch (e: any) {
    console.error('Unexpected error in createVouch:', e);
    return { data: null, error: new Error(e.message || 'Unexpected error') };
  }
};

/**
 * Fetch user's vouch history
 */
export const fetchUserVouchHistory = async (userId: string): Promise<ServiceResponse<Vouch[]>> => {
  try {
    const { data, error } = await supabase.rpc('get_user_vouch_history', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error fetching vouch history:', error);
      return { data: null, error: new Error(error.message) };
    }

    return {
      data: data ? data.map(mapVouchFromDB) : [],
      error: null,
    };
  } catch (e: any) {
    console.error('Unexpected error in fetchUserVouchHistory:', e);
    return { data: null, error: new Error(e.message || 'Unexpected error') };
  }
};


// ============================================
// FRIENDS & SOCIAL
// ============================================

/**
 * Fetch user's friends list
 */
export const fetchFriends = async (userId: string): Promise<ServiceResponse<Friend[]>> => {
  try {
    // Get all friend IDs
    const { data: friendships, error: friendshipsError } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', userId);

    if (friendshipsError) {
      console.error('Error fetching friendships:', friendshipsError);
      return { data: null, error: new Error(friendshipsError.message) };
    }

    if (!friendships || friendships.length === 0) {
      return { data: [], error: null };
    }

    const friendIds = friendships.map((f: any) => f.friend_id);

    // Get friend profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, branch, year, cookie_score')
      .in('id', friendIds);

    if (profilesError) {
      console.error('Error fetching friend profiles:', profilesError);
      return { data: null, error: new Error(profilesError.message) };
    }

    return {
      data: profiles ? profiles.map(mapProfileToFriend) : [],
      error: null,
    };
  } catch (e: any) {
    console.error('Unexpected error in fetchFriends:', e);
    return { data: null, error: new Error(e.message || 'Unexpected error') };
  }
};

/**
 * Fetch friend requests (both sent and received, only pending)
 */
export const fetchFriendRequests = async (userId: string): Promise<ServiceResponse<FriendRequest[]>> => {
  const { data, error } = await supabase
    .from('friend_requests')
    .select('id, from_user_id, to_user_id')
    .eq('status', 'pending')
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);

  if (error) {
    console.error('Error fetching friend requests:', error);
    return { data: null, error: new Error(error.message) };
  }

  return {
    data: data ? data.map(mapFriendRequestFromDB) : [],
    error: null,
  };
};

/**
 * Send a friend request
 */
export const sendFriendRequest = async (
  fromUserId: string,
  toUserId: string
): Promise<ServiceResponse<any[]>> => {
  // Check if a request already exists (in either direction)
  const { data: existing } = await supabase
    .from('friend_requests')
    .select('id')
    .or(`and(from_user_id.eq.${fromUserId},to_user_id.eq.${toUserId}),and(from_user_id.eq.${toUserId},to_user_id.eq.${fromUserId})`)
    .eq('status', 'pending')
    .maybeSingle();

  if (existing) {
    return { data: null, error: new Error('Friend request already exists') };
  }

  // Check if already friends
  const { data: friendship } = await supabase
    .from('friendships')
    .select('id')
    .eq('user_id', fromUserId)
    .eq('friend_id', toUserId)
    .maybeSingle();

  if (friendship) {
    return { data: null, error: new Error('Already friends') };
  }

  const { data, error } = await supabase
    .from('friend_requests')
    .insert([{ from_user_id: fromUserId, to_user_id: toUserId }])
    .select('id, from_user_id, to_user_id');

  if (error) {
    console.error('Error sending friend request:', error);
    return { data: null, error: new Error(error.message) };
  }

  return { data, error: null };
};

/**
 * Accept a friend request using the RPC function
 */
export const acceptFriendRequest = async (
  requestId: string,
  _fromUserId?: string,  // Not used, kept for backwards compatibility
  _toUserId?: string     // Not used, kept for backwards compatibility
): Promise<ServiceResponse<boolean>> => {
  try {
    const { data, error } = await supabase.rpc('accept_friend_request', {
      request_id: requestId,
    });

    if (error) {
      console.error('Error accepting friend request (RPC):', error);
      return { data: null, error: new Error(error.message) };
    }

    const rpcResponse = data as RpcResponse;
    
    if (!rpcResponse.success) {
      return {
        data: null,
        error: new Error(rpcResponse.error || 'Failed to accept friend request'),
      };
    }

    return { data: true, error: null };
  } catch (e: any) {
    console.error('Unexpected error in acceptFriendRequest:', e);
    return { data: null, error: new Error(e.message || 'Unexpected error') };
  }
};

/**
 * Reject a friend request
 */
export const rejectFriendRequest = async (requestId: string): Promise<ServiceResponse<any>> => {
  // Update status to rejected (or just delete)
  const { error } = await supabase
    .from('friend_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId);

  if (error) {
    console.error('Error rejecting friend request:', error);
    return { data: null, error: new Error(error.message) };
  }

  return { data: true, error: null };
};

/**
 * Remove a friend (deletes both friendship records)
 */
export const removeFriend = async (
  userId: string,
  friendId: string
): Promise<ServiceResponse<boolean>> => {
  try {
    // Delete both directions
    const { error: error1 } = await supabase
      .from('friendships')
      .delete()
      .match({ user_id: userId, friend_id: friendId });

    if (error1) {
      console.error('Error removing friendship (1):', error1);
      return { data: null, error: new Error(error1.message) };
    }

    const { error: error2 } = await supabase
      .from('friendships')
      .delete()
      .match({ user_id: friendId, friend_id: userId });

    if (error2) {
      console.error('Error removing friendship (2):', error2);
      return { data: null, error: new Error(error2.message) };
    }

    return { data: true, error: null };
  } catch (e: any) {
    console.error('Unexpected error in removeFriend:', e);
    return { data: null, error: new Error(e.message || 'Unexpected error') };
  }
};


// ============================================
// TAGS
// ============================================

/**
 * Fetch user's tags (created by them or member of)
 */
export const fetchTags = async (userId: string): Promise<ServiceResponse<Tag[]>> => {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .or(`creator_id.eq.${userId},member_ids.cs.{${userId}}`);

  if (error) {
    console.error('Error fetching tags:', error);
    return { data: null, error: new Error(error.message) };
  }

  return {
    data: data ? data.map(mapTagFromDB) : [],
    error: null,
  };
};

/**
 * Create a new tag
 */
export const createTag = async (
  tagData: Omit<Tag, 'id' | 'memberIds' | 'creator_id'>,
  userId: string
): Promise<ServiceResponse<Tag[]>> => {
  const dbData = {
    name: tagData.name,
    color: tagData.color,
    emoji: tagData.emoji,
    creator_id: userId,
    member_ids: [],
  };

  const { data, error } = await supabase
    .from('tags')
    .insert([dbData])
    .select();

  if (error) {
    console.error('Error creating tag:', error);
    return { data: null, error: new Error(error.message) };
  }

  return {
    data: data ? data.map(mapTagFromDB) : null,
    error: null,
  };
};

/**
 * Update a tag
 */
export const updateTag = async (
  tagId: string,
  updates: Partial<Omit<Tag, 'id' | 'creator_id'>>
): Promise<ServiceResponse<Tag[]>> => {
  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.color !== undefined) dbUpdates.color = updates.color;
  if (updates.emoji !== undefined) dbUpdates.emoji = updates.emoji;
  if (updates.memberIds !== undefined) dbUpdates.member_ids = updates.memberIds;

  const { data, error } = await supabase
    .from('tags')
    .update(dbUpdates)
    .eq('id', tagId)
    .select();

  if (error) {
    console.error('Error updating tag:', error);
    return { data: null, error: new Error(error.message) };
  }

  return {
    data: data ? data.map(mapTagFromDB) : null,
    error: null,
  };
};

/**
 * Delete a tag
 */
export const deleteTag = async (tagId: string): Promise<ServiceResponse<any>> => {
  return handleResponse(
    supabase.from('tags').delete().eq('id', tagId)
  );
};


// ============================================
// USER PROFILES
// ============================================

/**
 * Search users by username
 */
export const searchUsers = async (
  query: string,
  currentUserId: string
): Promise<ServiceResponse<Friend[]>> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, branch, year, cookie_score')
    .ilike('username', `%${query}%`)
    .neq('id', currentUserId)
    .limit(20);

  if (error) {
    console.error('Error searching users:', error);
    return { data: null, error: new Error(error.message) };
  }

  return {
    data: data ? data.map(mapProfileToFriend) : [],
    error: null,
  };
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<Profile>
): Promise<ServiceResponse<Profile[]>> => {
  const dbData: any = {};
  
  if (profileData.bio !== undefined) dbData.bio = profileData.bio;
  if (profileData.branch !== undefined) dbData.branch = profileData.branch;
  if (profileData.year !== undefined) dbData.year = profileData.year;
  if (profileData.expertise !== undefined) dbData.expertise = profileData.expertise;
  if (profileData.interests !== undefined) dbData.interests = profileData.interests;
  if (profileData.privacy !== undefined) dbData.privacy = profileData.privacy;

  const { data, error } = await supabase
    .from('profiles')
    .update(dbData)
    .eq('id', userId)
    .select();

  if (error) {
    console.error('Error updating profile:', error);
    return { data: null, error: new Error(error.message) };
  }

  // Map to frontend Profile format
  const mappedData = data ? data.map((p: any) => ({
    username: p.username,
    bio: p.bio || '',
    branch: p.branch || 'Not set',
    year: p.year || 2025,
    expertise: p.expertise || [],
    interests: p.interests || [],
    cookieScore: p.cookie_score || 0,
    privacy: p.privacy || 'public',
    skillScores: p.skill_scores || {},
    vouchHistory: [],
  })) : null;

  return { data: mappedData, error: null };
};

/**
 * Fetch profiles by IDs
 */
export const fetchProfilesByIds = async (userIds: string[]): Promise<ServiceResponse<Friend[]>> => {
  if (!userIds || userIds.length === 0) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, branch, year, cookie_score')
    .in('id', userIds);

  if (error) {
    console.error('Error fetching profiles:', error);
    return { data: null, error: new Error(error.message) };
  }

  return {
    data: data ? data.map(mapProfileToFriend) : [],
    error: null,
  };
};


// ============================================
// SESSION HISTORY & MESSAGES
// ============================================

/**
 * Fetch user's session history (closed sessions)
 */
export const fetchUserSessionHistory = async (userId: string): Promise<ServiceResponse<Session[]>> => {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      creator:profiles!creator_id(username)
    `)
    .or(`creator_id.eq.${userId},participants.cs.{${userId}}`)
    .eq('status', 'closed')
    .order('event_time', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching session history:', error);
    return { data: null, error: new Error(error.message) };
  }

  return {
    data: data ? data.map(mapSessionFromDB) : [],
    error: null,
  };
};

/**
 * Fetch messages for a session
 */
export const fetchSessionMessages = async (sessionId: number): Promise<ServiceResponse<SessionMessage[]>> => {
  const { data, error } = await supabase
    .from('session_messages')
    .select(`
      *,
      sender:profiles!sender_id(username)
    `)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching session messages:', error);
    return { data: null, error: new Error(error.message) };
  }

  return { data, error: null };
};

/**
 * Send a message in a session
 */
export const sendSessionMessage = async (
  sessionId: number,
  senderId: string,
  text: string
): Promise<ServiceResponse<any>> => {
  return handleResponse(
    supabase
      .from('session_messages')
      .insert([{ session_id: sessionId, sender_id: senderId, text }])
  );
};


// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Fetch user's notifications with enriched data
 */
export const fetchNotifications = async (userId: string): Promise<ServiceResponse<Notification[]>> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      return { data: null, error: new Error(error.message) };
    }

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    // Enrich notifications with user/session/tag details
    const enrichedData: Notification[] = await Promise.all(
      data.map(async (n: any) => {
        let user: { id: string; username: string } | undefined;
        let session: { id: number; title: string; emoji: string } | undefined;
        let tag: { id: string; name: string } | undefined;

        if (n.actor_id) {
          const { data: userData } = await supabase
            .from('profiles')
            .select('id, username')
            .eq('id', n.actor_id)
            .single();
          if (userData) {
            user = { id: userData.id, username: userData.username };
          }
        }

        if (n.session_id) {
          const { data: sessionData } = await supabase
            .from('sessions')
            .select('id, title, emoji')
            .eq('id', n.session_id)
            .single();
          if (sessionData) {
            session = { id: sessionData.id, title: sessionData.title, emoji: sessionData.emoji };
          }
        }

        if (n.tag_id) {
          const { data: tagData } = await supabase
            .from('tags')
            .select('id, name')
            .eq('id', n.tag_id)
            .single();
          if (tagData) {
            tag = { id: tagData.id, name: tagData.name };
          }
        }

        return {
          id: n.id,
          type: n.type,
          user,
          session,
          tag,
          timestamp: n.created_at,
          isRead: n.is_read,
        };
      })
    );

    return { data: enrichedData, error: null };
  } catch (e: any) {
    console.error('Unexpected error in fetchNotifications:', e);
    return { data: null, error: new Error(e.message || 'Unexpected error') };
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<ServiceResponse<any>> => {
  return handleResponse(
    supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
  );
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<ServiceResponse<any>> => {
  return handleResponse(
    supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId)
      .eq('is_read', false)
  );
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<ServiceResponse<any>> => {
  return handleResponse(
    supabase.from('notifications').delete().eq('id', notificationId)
  );
};

/**
 * Create a notification using the safe RPC function
 */
export const createNotification = async (
  notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>,
  recipientId: string
): Promise<ServiceResponse<any>> => {
  try {
    const { data, error } = await supabase.rpc('create_notification_safe', {
      p_recipient_id: recipientId,
      p_type: notificationData.type,
      p_actor_id: notificationData.user?.id || null,
      p_session_id: notificationData.session?.id || null,
      p_tag_id: notificationData.tag?.id || null,
    });

    if (error) {
      console.error('Error creating notification (RPC):', error);
      return { data: null, error: new Error(error.message) };
    }

    const rpcResponse = data as RpcResponse;

    if (!rpcResponse.success) {
      // If it was skipped (self-notification), don't treat as error
      if (rpcResponse.skipped) {
        return { data: rpcResponse, error: null };
      }
      return {
        data: null,
        error: new Error(rpcResponse.error || 'Failed to create notification'),
      };
    }

    return { data: rpcResponse, error: null };
  } catch (e: any) {
    console.error('Unexpected error in createNotification:', e);
    return { data: null, error: new Error(e.message || 'Unexpected error') };
  }
};


// ============================================
// DIRECT MESSAGES
// ============================================

/**
 * Fetch user's conversations
 */
export const fetchConversationsForUser = async (userId: string): Promise<ServiceResponse<Conversation[]>> => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .contains('participant_ids', [userId])
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return { data: null, error: new Error(error.message) };
  }

  return {
    data: data ? data.map((c: any) => ({
      id: c.id,
      participantIds: c.participant_ids,
      messages: [],
      unreadCount: 0,
    })) : [],
    error: null,
  };
};

/**
 * Fetch messages for a conversation
 */
export const fetchMessagesForConversation = async (conversationId: string): Promise<ServiceResponse<DirectMessage[]>> => {
  const { data, error } = await supabase
    .from('direct_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return { data: null, error: new Error(error.message) };
  }

  return {
    data: data ? data.map(mapDirectMessageFromDB) : [],
    error: null,
  };
};

/**
 * Send a direct message
 */
export const sendDirectMessage = async (
  conversationId: string,
  senderId: string,
  text: string
): Promise<ServiceResponse<DirectMessage[]>> => {
  const { data, error } = await supabase
    .from('direct_messages')
    .insert([{ conversation_id: conversationId, sender_id: senderId, text }])
    .select();

  if (error) {
    console.error('Error sending direct message:', error);
    return { data: null, error: new Error(error.message) };
  }

  return {
    data: data ? data.map(mapDirectMessageFromDB) : null,
    error: null,
  };
};

/**
 * Get or create a conversation between two users
 */
export const getOrCreateConversation = async (
  userId1: string,
  userId2: string
): Promise<ServiceResponse<Omit<Conversation, 'messages' | 'unreadCount'>>> => {
  try {
    const { data: conversationId, error } = await supabase.rpc('get_or_create_conversation', {
      user_id_1: userId1,
      user_id_2: userId2,
    });

    if (error) {
      console.error('Error getting/creating conversation (RPC):', error);
      return { data: null, error: new Error(error.message) };
    }

    // Fetch the full conversation data
    const { data: conversation, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (fetchError) {
      console.error('Error fetching conversation:', fetchError);
      return { data: null, error: new Error(fetchError.message) };
    }

    return {
      data: {
        id: conversation.id,
        participantIds: conversation.participant_ids,
      },
      error: null,
    };
  } catch (e: any) {
    console.error('Unexpected error in getOrCreateConversation:', e);
    return { data: null, error: new Error(e.message || 'Unexpected error') };
  }
};