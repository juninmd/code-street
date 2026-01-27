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

  sql += ' ORDER BY votes DESC';

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
  const { title, description, category } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const sql = 'INSERT INTO features (title, description, category) VALUES (?, ?, ?)';
  const params = [title, description || '', category || 'feature'];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    // Fetch the created feature to return full object
    db.get('SELECT * FROM features WHERE id = ?', [this.lastID], (err, row) => {
         if (err) {
             res.json({
                 message: 'Feature created',
                 data: { id: this.lastID, title, description, category: category || 'feature', votes: 0, pledged_amount: 0, status: 'under_review' }
             });
             return;
         }
         res.json({ message: 'Feature created', data: row });
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
