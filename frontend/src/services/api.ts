import { supabase } from '../lib/supabase';

export const authService = {
  async register(userData: { username: string; email: string; password: string; full_name: string }) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          username: userData.username,
          full_name: userData.full_name,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Registration failed');

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    return { user: profile };
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

    return { user: profile };
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

    return profile;
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

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .eq('slug', slug)
      .single();

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

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('contests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async joinContest(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('contest_participants')
      .insert({ contest_id: id, user_id: user.id });

    if (error) throw error;
    return { success: true };
  },

  async getParticipants(id: string) {
    const { data, error } = await supabase
      .from('contest_participants')
      .select('*, profile:profiles(*)')
      .eq('contest_id', id);

    if (error) throw error;
    return data;
  },
};

export const submissionService = {
  async submit(problemId: string, code: string, language: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        problem_id: problemId,
        user_id: user.id,
        code,
        language,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMySubmissions(limit = 20) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('submissions')
      .select('*, problem:problems(title, slug)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('submissions')
      .select('*, problem:problems(title, slug, difficulty)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
};

export const leaderboardService = {
  async getLeaderboard(limit = 50) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, rating, problems_solved')
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },
};

export const roomService = {
  async createRoom(contestId: string, name: string, maxParticipants: number = 20) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data, error } = await supabase
      .from('contest_rooms')
      .insert({
        contest_id: contestId,
        name,
        room_code: roomCode,
        max_participants: maxParticipants,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async joinRoom(roomCode: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: room, error: roomError } = await supabase
      .from('contest_rooms')
      .select('*')
      .eq('room_code', roomCode)
      .single();

    if (roomError) throw roomError;

    const { error: joinError } = await supabase
      .from('room_participants')
      .insert({
        room_id: room.id,
        user_id: user.id,
      });

    if (joinError) throw joinError;
    return room;
  },

  async getRoomById(roomId: string) {
    const { data, error } = await supabase
      .from('contest_rooms')
      .select('*, contest:contests(*)')
      .eq('id', roomId)
      .single();

    if (error) throw error;
    return data;
  },

  async getActiveRooms() {
    const { data, error } = await supabase
      .from('contest_rooms')
      .select('*, contest:contests(*)')
      .in('status', ['waiting', 'active'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getRoomParticipants(roomId: string) {
    const { data, error } = await supabase
      .from('room_participants')
      .select('*, profile:profiles(*)')
      .eq('room_id', roomId)
      .order('score', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateRoomStatus(roomId: string, status: 'waiting' | 'active' | 'completed') {
    const { error } = await supabase
      .from('contest_rooms')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', roomId);

    if (error) throw error;
  },

  async leaveRoom(roomId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('room_participants')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  subscribeToRoom(roomId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'room_participants',
        filter: `room_id=eq.${roomId}`,
      }, callback)
      .subscribe();
  },

  subscribeToChat(roomId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`chat:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'room_chat_messages',
        filter: `room_id=eq.${roomId}`,
      }, callback)
      .subscribe();
  },
};

export const chatService = {
  async sendMessage(roomId: string, message: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('room_chat_messages')
      .insert({
        room_id: roomId,
        user_id: user.id,
        message,
      });

    if (error) throw error;
  },

  async getMessages(roomId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('room_chat_messages')
      .select('*, profile:profiles(username, avatar_url)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data?.reverse() || [];
  },
};

export const codeExecutionService = {
  async executeCode(code: string, language: string, testCases: any[], problemId: string, roomId?: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/execute-code`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          test_cases: testCases,
          problem_id: problemId,
          room_id: roomId,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Code execution failed');
    }

    return response.json();
  },
};
