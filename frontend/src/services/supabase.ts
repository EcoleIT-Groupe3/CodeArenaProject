import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  country?: string;
  rating: number;
  problems_solved: number;
  contests_participated: number;
  created_at: string;
  updated_at: string;
};

export type Problem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  category: string;
  points: number;
  acceptance_rate: number;
  total_submissions: number;
  solved_count: number;
  created_at: string;
};

export type Contest = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed';
  participants_count: number;
  created_at: string;
};

export type Submission = {
  id: string;
  user_id: string;
  problem_id: string;
  code: string;
  language: string;
  status: 'pending' | 'accepted' | 'rejected';
  execution_time?: number;
  memory_used?: number;
  created_at: string;
};

export type ContestParticipant = {
  id: string;
  contest_id: string;
  user_id: string;
  score: number;
  rank?: number;
  problems_solved: number;
  joined_at: string;
};
