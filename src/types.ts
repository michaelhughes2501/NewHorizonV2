export interface User {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  bio?: string;
  location?: string;
  history?: string;
  facility?: string;
  role?: string;
  is_admin?: number;
  is_mentor?: number;
  is_verified?: number;
  is_suspended?: number;
  hide_location?: number;
  hide_history?: number;
  recovery_stage?: string;
  interests?: string;
  avatar_color?: string;
  created_at?: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  content: string;
  link?: string;
  is_read: number;
  timestamp: string;
}

export interface Kite {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_anonymous?: number;
  is_read?: number;
  timestamp: string;
  sender_name?: string;
  avatar_color?: string;
}

export interface Thread {
  id: string;
  author_id: string;
  author_name: string;
  title: string;
  content: string;
  category: string;
  is_anonymous?: number;
  is_flagged?: number;
  upvotes: number;
  reply_count?: number;
  created_at: string;
  avatar_color?: string;
}

export interface Reply {
  id: string;
  thread_id: string;
  author_id: string;
  author_name: string;
  content: string;
  is_anonymous?: number;
  upvotes: number;
  created_at: string;
  avatar_color?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  salary_range?: string;
  is_felony_friendly: number;
  support_level?: string;
  category?: string;
  posted_by: string;
  posted_by_name?: string;
  created_at: string;
}

export interface Mentorship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  mentor_name?: string;
  mentee_name?: string;
  mentor_avatar?: string;
  mentee_avatar?: string;
  status: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  category: string;
  created_by: string;
  creator_name?: string;
  member_count?: number;
  is_private: number;
  created_at: string;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  is_anonymous?: number;
  timestamp: string;
  avatar_color?: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  mood: number;
  note?: string;
  date: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  title?: string;
  content: string;
  is_shared: number;
  created_at: string;
}

export interface Achievement {
  id: string;
  badge: string;
  label: string;
  earned_at: string;
}

export interface SuccessStory {
  id: string;
  user_id: string;
  author_name: string;
  title: string;
  content: string;
  is_anonymous: number;
  upvotes: number;
  created_at: string;
}
