import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  username: string;
  email: string;
  score: number;
  rank: number;
  created_at: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  test_cases: Array<{ input: string; output: string }>;
  time_limit: number;
  memory_limit: number;
  created_at: string;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  problem_ids: string[];
  status: 'upcoming' | 'active' | 'completed';
  created_by: string;
  created_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  problem_id: string;
  contest_id?: string;
  code: string;
  language: string;
  status: 'pending' | 'running' | 'accepted' | 'wrong_answer' | 'error' | 'timeout';
  result: any;
  score: number;
  execution_time: number;
  memory_used: number;
  submitted_at: string;
}

export interface ContestParticipant {
  id: string;
  contest_id: string;
  user_id: string;
  score: number;
  rank: number;
  joined_at: string;
}
