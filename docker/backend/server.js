// ================================================================================
// Backend Server - CodeArena API
// ================================================================================
// Serveur Node.js pour gérer:
// - API REST pour les problèmes, défis, soumissions
// - Exécution sécurisée du code utilisateur (sandbox)
// - Connexion à Supabase pour la persistance
// - Gestion du cache Redis pour le leaderboard
// ================================================================================

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS
app.use(cors());
app.use(express.json());

// Connexion Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ================================================================================
// HEALTH CHECK ENDPOINT
// ================================================================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ================================================================================
// READINESS CHECK ENDPOINT
// ================================================================================
app.get('/ready', async (req, res) => {
  try {
    // Vérifier la connexion à Supabase
    const { error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;

    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

// ================================================================================
// API ENDPOINTS
// ================================================================================

// GET /api/problems - Liste des problèmes
app.get('/api/problems', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/daily-challenge - Défi du jour
app.get('/api/daily-challenge', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('challenge_date', today)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/leaderboard - Classement global
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, score, rank')
      .order('score', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/submit - Soumettre une solution
app.post('/api/submit', async (req, res) => {
  try {
    const { user_id, problem_id, code, language } = req.body;

    // TODO: Exécuter le code dans le sandbox
    // Pour l'instant, simulation
    const status = Math.random() > 0.3 ? 'accepted' : 'wrong_answer';

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        user_id,
        problem_id,
        code,
        language,
        status,
        score: status === 'accepted' ? 100 : 0
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================================================================================
// ERROR HANDLING
// ================================================================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ================================================================================
// START SERVER
// ================================================================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Readiness check: http://localhost:${PORT}/ready`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
