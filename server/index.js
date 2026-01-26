const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Get all features
app.get('/api/features', (req, res) => {
  db.all('SELECT * FROM features ORDER BY votes DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Create a new feature
app.post('/api/features', (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const sql = 'INSERT INTO features (title, description) VALUES (?, ?)';
  const params = [title, description || ''];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Feature created',
      data: { id: this.lastID, title, description, votes: 0, status: 'under_review' }
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


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
