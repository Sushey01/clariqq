export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export type Mastery = {
  concept_id: string;
  name: string;
  subject: string;
  chapter: string;
  m: number;
  confused: boolean;
};

export type WeeklyReport = {
  user_id: string;
  window_days: number;
  event_count: number;
  mean_st: number | null;
  weakest: Mastery[];
  confused: Mastery[];
};

export type Activity = {
  days: { date: string; count: number }[];
  current_streak: number;
  longest_streak: number;
  active_days: number;
};

export type LinkedStudent = {
  id: string;
  name: string;
  email: string;
};

export type ChatReply = {
  answer: string;
  session_id: string;
};
