const express = require('express');
const cors = require('cors');
const db = require('./db');
const util = require('util');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Promisify DB methods
const dbGet = util.promisify(db.get).bind(db);
const dbAll = util.promisify(db.all).bind(db);
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
};

// Get all features (with optional category filter)
app.get('/api/features', async (req, res) => {
  const { category } = req.query;
  let sql = 'SELECT * FROM features';
  let params = [];

  if (category && category !== 'all') {
    sql += ' WHERE category = ?';
    params.push(category);
  }

  sql += ' ORDER BY is_boosted DESC, votes DESC';

  try {
    const rows = await dbAll(sql, params);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new feature
app.post('/api/features', async (req, res) => {
  const { title, description, category, initial_pledge, deadline } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const pledge = (initial_pledge && !isNaN(initial_pledge)) ? parseFloat(initial_pledge) : 0;

  const sql = 'INSERT INTO features (title, description, category, pledged_amount, deadline) VALUES (?, ?, ?, ?, ?)';
  const params = [title, description || '', category || 'feature', pledge, deadline || null];

  try {
    const { lastID } = await dbRun(sql, params);

    // If there was an initial pledge, record it in history
    if (pledge > 0) {
        await dbRun('INSERT INTO pledges (feature_id, amount) VALUES (?, ?)', [lastID, pledge]);
    }

    const row = await dbGet('SELECT * FROM features WHERE id = ?', [lastID]);
    res.json({ message: 'Feature created', data: row });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Platform Stats
app.get('/api/stats', async (req, res) => {
    try {
        const [payoutRow, activeRow, topCategoryRow, burnedRow] = await Promise.all([
            dbGet("SELECT SUM(pledged_amount) as val FROM features WHERE status = 'live'"),
            dbGet("SELECT SUM(pledged_amount) as val FROM features WHERE status != 'live'"),
            dbGet("SELECT category, SUM(pledged_amount) as total FROM features GROUP BY category ORDER BY total DESC LIMIT 1"),
            dbGet("SELECT SUM(pledged_amount) as val FROM features WHERE status != 'live' AND deadline < datetime('now')")
        ]);

        const stats = {};
        stats.total_payout = payoutRow && payoutRow.val ? payoutRow.val : 0;
        stats.active_bounty = activeRow && activeRow.val ? activeRow.val : 0;
        stats.top_category = topCategoryRow ? topCategoryRow.category : 'N/A';
        stats.burned_amount = burnedRow && burnedRow.val ? burnedRow.val : 0;

        const totalMoney = (stats.total_payout || 0) + (stats.active_bounty || 0);
        // Revenue = 5% of everything + 100% of Burned items
        stats.platform_revenue = (totalMoney * 0.05) + stats.burned_amount;

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Vote for a feature
app.post('/api/features/:id/vote', async (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE features SET votes = votes + 1 WHERE id = ?';

  try {
    const { changes } = await dbRun(sql, id);
    if (changes === 0) {
        res.status(404).json({ error: 'Feature not found' });
        return;
    }
    res.json({ message: 'Voted', changes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Boost a feature (Simulated Payment)
app.post('/api/features/:id/boost', async (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE features SET is_boosted = 1 WHERE id = ?';

  try {
    const { changes } = await dbRun(sql, id);
    if (changes === 0) {
        res.status(404).json({ error: 'Feature not found' });
        return;
    }
    res.json({ message: 'Boosted', changes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Pledge to a feature
app.post('/api/features/:id/pledge', async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
      res.status(400).json({ error: 'Valid amount is required' });
      return;
  }

  const sqlFeature = 'UPDATE features SET pledged_amount = pledged_amount + ? WHERE id = ?';
  const sqlPledge = 'INSERT INTO pledges (feature_id, amount) VALUES (?, ?)';

  try {
    // 1. Record the pledge transaction
    await dbRun(sqlPledge, [id, amount]);

    // 2. Update the total amount
    const { changes } = await dbRun(sqlFeature, [amount, id]);

    if (changes === 0) {
        res.status(404).json({ error: 'Feature not found' });
        return;
    }
    res.json({ message: 'Pledged', changes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get pledge history for a feature
app.get('/api/features/:id/history', async (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM pledges WHERE feature_id = ? ORDER BY created_at ASC';

    try {
        const rows = await dbAll(sql, [id]);
        res.json({ data: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update status (Admin)
app.patch('/api/features/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
  }

  const sql = 'UPDATE features SET status = ? WHERE id = ?';

  try {
    const { changes } = await dbRun(sql, [status, id]);
    if (changes === 0) {
        res.status(404).json({ error: 'Feature not found' });
        return;
    }
    res.json({ message: 'Status updated', changes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Comments API ---

// Get comments for a feature
app.get('/api/features/:id/comments', async (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM comments WHERE feature_id = ? ORDER BY created_at ASC';

    try {
        const rows = await dbAll(sql, [id]);
        res.json({ data: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Post a comment
app.post('/api/features/:id/comments', async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
        res.status(400).json({ error: 'Content is required' });
        return;
    }

    const sql = 'INSERT INTO comments (feature_id, content) VALUES (?, ?)';

    try {
        const { lastID } = await dbRun(sql, [id, content]);
        const row = await dbGet('SELECT * FROM comments WHERE id = ?', [lastID]);
        res.json({ message: 'Comment added', data: row });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Panic Button (Extend Deadline)
app.post('/api/features/:id/panic', async (req, res) => {
    const { id } = req.params;
    const FEE = 5;

    try {
        const feature = await dbGet('SELECT * FROM features WHERE id = ?', [id]);
        if (!feature) {
            res.status(404).json({ error: 'Feature not found' });
            return;
        }

        const currentDeadline = feature.deadline ? new Date(feature.deadline) : new Date();
        const newDeadline = new Date(currentDeadline.getTime() + 24 * 60 * 60 * 1000);

        // Update deadline and pledged amount
        await dbRun('UPDATE features SET deadline = ?, pledged_amount = pledged_amount + ? WHERE id = ?', [newDeadline.toISOString(), FEE, id]);

        // Record the fee
        await dbRun('INSERT INTO pledges (feature_id, amount) VALUES (?, ?)', [id, FEE]);

        res.json({ message: 'Panic Mode Activated! Deadline extended by 24h.', new_deadline: newDeadline });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
