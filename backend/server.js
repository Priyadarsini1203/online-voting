const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// --- AUTH ---
app.post('/api/auth/register', async (req, res) => {
  const { student_id, name, password, department, year } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO users (student_id, name, password, department, year) VALUES (?, ?, ?, ?, ?)',
      [student_id, name, hashedPassword, department, year]
    );
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { student_id, password } = req.body;
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE student_id = ?', [student_id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, student_id: user.student_id, has_voted: user.has_voted, department: user.department, year: user.year } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CANDIDATES ---
app.get('/api/candidates', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM candidates');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/candidates', async (req, res) => {
  const { name, position, department, image_url } = req.body;
  try {
    await db.execute('INSERT INTO candidates (name, position, department, image_url) VALUES (?, ?, ?, ?)', [name, position, department, image_url || '']);
    res.status(201).json({ message: 'Candidate added' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/candidates/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM candidates WHERE id = ?', [req.params.id]);
    res.json({ message: 'Candidate deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- SETTINGS ---
app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT election_status FROM settings WHERE id = 1');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  const { election_status } = req.body;
  try {
    await db.execute('UPDATE settings SET election_status = ? WHERE id = 1', [election_status]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- VOTING ---
app.post('/api/vote', async (req, res) => {
  const { userId, candidateVotes } = req.body; // candidateVotes: [{candidateId, position}]
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [user] = await conn.execute('SELECT has_voted FROM users WHERE id = ?', [userId]);
    if (user[0].has_voted) throw new Error('Already voted');

    for (const v of candidateVotes) {
      await conn.execute('INSERT INTO votes (user_id, candidate_id, position) VALUES (?, ?, ?)', [userId, v.candidateId, v.position]);
      await conn.execute('UPDATE candidates SET votes_count = votes_count + 1 WHERE id = ?', [v.candidateId]);
    }

    await conn.execute('UPDATE users SET has_voted = TRUE WHERE id = ?', [userId]);
    await conn.commit();
    res.json({ message: 'Vote cast' });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// --- RESULTS ---
app.get('/api/results', async (req, res) => {
  try {
    const [candidates] = await db.execute('SELECT * FROM candidates ORDER BY position, votes_count DESC');
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const [voters] = await db.execute('SELECT COUNT(*) as total FROM users WHERE role = "voter"');
    const [polled] = await db.execute('SELECT COUNT(*) as count FROM users WHERE has_voted = TRUE');
    res.json({ totalRegistered: voters[0].total, votesPolled: polled[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/voters', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT student_id, name, department, year, has_voted FROM users WHERE role = "voter"');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
