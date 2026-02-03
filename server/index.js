const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Get all features (with optional category filter)
app.get('/api/features', (req, res) => {
  const { category } = req.query;
  let sql = 'SELECT * FROM features';
  let params = [];

  if (category && category !== 'all') {
    sql += ' WHERE category = ?';
    params.push(category);
  }

  sql += ' ORDER BY is_boosted DESC, votes DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Create a new feature
app.post('/api/features', (req, res) => {
  const { title, description, category, initial_pledge } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const pledge = (initial_pledge && !isNaN(initial_pledge)) ? parseFloat(initial_pledge) : 0;

  const sql = 'INSERT INTO features (title, description, category, pledged_amount) VALUES (?, ?, ?, ?)';
  const params = [title, description || '', category || 'feature', pledge];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    const featureId = this.lastID;

    // Fetch the created feature to return full object
    db.get('SELECT * FROM features WHERE id = ?', [featureId], (fetchErr, row) => {
         if (fetchErr) {
             // If fetching the new row fails, return the constructed object so the UI doesn't break
             res.json({
                 message: 'Feature created',
                 data: { id: featureId, title, description, category: category || 'feature', votes: 0, pledged_amount: pledge, status: 'under_review' }
             });
             return;
         }
         res.json({ message: 'Feature created', data: row });
    });
  });
});

// Get Platform Stats
app.get('/api/stats', (req, res) => {
    const stats = {};

    // 1. Total Payout (live)
    db.get("SELECT SUM(pledged_amount) as val FROM features WHERE status = 'live'", [], (err, row) => {
        if (err) return res.status(500).json({error: err.message});
        stats.total_payout = row && row.val ? row.val : 0;

        // 2. Active Bounty (not live)
        db.get("SELECT SUM(pledged_amount) as val FROM features WHERE status != 'live'", [], (err, row) => {
            if (err) return res.status(500).json({error: err.message});
            stats.active_bounty = row && row.val ? row.val : 0;

            // 3. Top Category
            db.get("SELECT category, SUM(pledged_amount) as total FROM features GROUP BY category ORDER BY total DESC LIMIT 1", [], (err, row) => {
                 if (err) return res.status(500).json({error: err.message});
                 stats.top_category = row ? row.category : 'N/A';

                 // 4. Platform Revenue (Simulated 5%)
                 // We calculate based on all money in the system (payout + active)
                 const totalMoney = (stats.total_payout || 0) + (stats.active_bounty || 0);
                 stats.platform_revenue = totalMoney * 0.05;

                 res.json(stats);
            });
        });
    });
});

// Vote for a feature
app.post('/api/features/:id/vote', (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE features SET votes = votes + 1 WHERE id = ?';

  db.run(sql, id, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
        res.status(404).json({ error: 'Feature not found' });
        return;
    }
    res.json({ message: 'Voted', changes: this.changes });
  });
});

// Boost a feature (Simulated Payment)
app.post('/api/features/:id/boost', (req, res) => {
  const { id } = req.params;
  // In a real app, we would verify payment here.
  // For this simulation, we just mark it as boosted.

  const sql = 'UPDATE features SET is_boosted = 1 WHERE id = ?';

  db.run(sql, id, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
        res.status(404).json({ error: 'Feature not found' });
        return;
    }
    res.json({ message: 'Boosted', changes: this.changes });
  });
});

// Pledge to a feature
app.post('/api/features/:id/pledge', (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
      res.status(400).json({ error: 'Valid amount is required' });
      return;
  }

  const sql = 'UPDATE features SET pledged_amount = pledged_amount + ? WHERE id = ?';

  db.run(sql, [amount, id], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
        res.status(404).json({ error: 'Feature not found' });
        return;
    }
    res.json({ message: 'Pledged', changes: this.changes });
  });
});

// Update status (Admin)
app.patch('/api/features/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
  }

  const sql = 'UPDATE features SET status = ? WHERE id = ?';

  db.run(sql, [status, id], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
        res.status(404).json({ error: 'Feature not found' });
        return;
    }
    res.json({ message: 'Status updated', changes: this.changes });
  });
});

// --- Comments API ---

// Get comments for a feature
app.get('/api/features/:id/comments', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM comments WHERE feature_id = ? ORDER BY created_at ASC';

    db.all(sql, [id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// Post a comment
app.post('/api/features/:id/comments', (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
        res.status(400).json({ error: 'Content is required' });
        return;
    }

    const sql = 'INSERT INTO comments (feature_id, content) VALUES (?, ?)';
    db.run(sql, [id, content], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        db.get('SELECT * FROM comments WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
                 res.json({ message: 'Comment added', data: { id: this.lastID, feature_id: id, content } });
                 return;
            }
            res.json({ message: 'Comment added', data: row });
        })
    });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
