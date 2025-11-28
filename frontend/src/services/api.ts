import { supabase } from './supabase';

export const authService = {
  async register(userData: { username: string; email: string; password: string; full_name: string }) {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          username: userData.username,
          full_name: userData.full_name,
        },
      },
    });

    if (error) throw error;
    return { user: data.user, token: data.session?.access_token };
  },

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    return {
      user: { ...data.user, ...profile },
      token: data.session.access_token
    };
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return { ...user, ...profile };
  },

  async isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },
};

export const problemService = {
  async getAll(filters?: { difficulty?: string; category?: string; search?: string }) {
    let query = supabase.from('problems').select('*');

    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};

export const contestService = {
  async getAll(status?: string) {
    let query = supabase.from('contests').select('*');

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('start_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('contests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async joinContest(id: string) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('contest_participants')
      .insert({
        contest_id: id,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getParticipants(id: string) {
    const { data, error } = await supabase
      .from('contest_participants')
      .select(`
        *,
        profiles (username, avatar_url, rating)
      `)
      .eq('contest_id', id)
      .order('score', { ascending: false });

    if (error) throw error;
    return data;
  },
};

export const submissionService = {
  async submit(problemId: string, code: string, language: string) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const status = Math.random() > 0.3 ? 'accepted' : 'rejected';
    const execution_time = Math.floor(Math.random() * 1000);
    const memory_used = Math.floor(Math.random() * 50000);

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        user_id: user.id,
        problem_id: problemId,
        code,
        language,
        status,
        execution_time,
        memory_used,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMySubmissions(limit = 20) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        problems (title, slug, difficulty)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};

export const leaderboardService = {
  async getLeaderboard(limit = 50) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },
};
