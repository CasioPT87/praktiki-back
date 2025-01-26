export type Role = {
  id: number;
  value: number;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type User = {
  id: number; // Primary key, auto-incrementing
  name: string;
  role_id: number; // Foreign key referencing 'role.id'
  created_at: Date; // Timestamp for creation
  updated_at: Date; // Timestamp for last update
  deleted_at: Date | null; // Nullable timestamp for soft deletion
};

export type Icon = {
  id: number; // Primary key, auto-incrementing
  path: string; // File path, non-nullable
  created_at: Date; // Timestamp for creation
  updated_at: Date; // Timestamp for last update
  deleted_at: Date | null; // Nullable timestamp for soft deletion
};

export type Country = {
  id: number; // Primary key, auto-incrementing
  name: string; // Country name, non-nullable
  created_at: Date; // Timestamp for creation
  updated_at: Date; // Timestamp for last update
  deleted_at: Date | null; // Nullable timestamp for soft deletion
};

export type BlockedUser = {
  id: number; // Primary key, auto-incrementing
  user_id: number; // ID of the user who blocked someone (foreign key to the 'user' table)
  blocked_user: number; // ID of the blocked user (foreign key to the 'user' table)
  created_at: Date; // Timestamp for creation
  updated_at: Date; // Timestamp for last update
  deleted_at: Date | null; // Nullable timestamp for soft deletion
};

export type Location = {
  id: number;
  name: string;
  x_coordinates: number | null;
  y_coordinates: number | null;
  country_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type UserSessionOnline = {
  id: number;
  user_id: number;
  start: Date;
  end: Date;
};

export type Language = {
  id: number;
  name: string;
  icon_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type LanguageCombination = {
  id: number;
  language_1: number;
  language_2: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type PrivateChat = {
  id: number;
  user_id_1: number;
  user_id_2: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type PrivateChatRequest = {
  id: number;
  request: number;
  asked: number;
  accepted: Date | null;
  rejected: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type Notification = {
  id: number;
  user_id: number;
  text: string;
  read: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type PrivateChatMessage = {
  id: number;
  user_id: number;
  text: string;
  private_chat_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type LocationChat = {
  id: number;
  location_id: number;
  languages_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type LocationChatMessage = {
  id: number;
  user_id: number;
  location_chat_id: number;
  text: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type Event = {
  id: number;
  location_chat_id: number;
  date: Date;
  creator_user_id: number;
  link: string | null;
  title: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type EventAttendance = {
  id: number;
  event_id: number;
  user_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type UserRate = {
  id: number;
  target_user_id: number;
  voter_user_id: number;
  rate: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type EventComment = {
  id: number;
  location_chat_id: number;
  text: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type UserAuth = {
  id: number;
  user_id: number;
  password: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};
