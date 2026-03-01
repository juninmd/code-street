const express = require('express');
const cors = require('cors');
const db = require('./db');
const util = require('util');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Global variable to track the latest IPO timestamp
let latestIPOTimestamp = Date.now();

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
    const [rows, recentPledges] = await Promise.all([
        dbAll(sql, params),
        dbAll('SELECT feature_id, amount, created_at FROM pledges ORDER BY created_at DESC LIMIT 1000')
    ]);

    const data = rows.map(row => {
        // Get recent pledges for this feature to build a sparkline
        let deltas = recentPledges
            .filter(p => p.feature_id === row.id)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            .map(p => p.amount);

        // Convert deltas to cumulative history for trend line
        let runningTotal = 0;
        let history = deltas.map(d => {
            runningTotal += d;
            return runningTotal;
        });

        // If sparse data, fill with deterministic "noise" to look like a chart
        if (history.length < 5) {
            let val = (row.pledged_amount || 0) * 0.1;
            for(let i=0; i<10; i++) {
                val += Math.sin(row.id * (i+1)) * 5;
                history.push(Math.abs(val) + 1);
            }
        }

        // Take last 20 points
        history = history.slice(-20);

        const pledge = row.pledged_amount || 0;
        const current_price = 1.00 + (row.votes * 0.10) + (pledge * 0.001);
        // Deterministic 24h change based on ID
        const day_change = ((row.id * 13.5) % 10) - 5;

        return {
            ...row,
            current_price: parseFloat(current_price.toFixed(2)),
            day_change: parseFloat(day_change.toFixed(2)),
            hype_score: (row.votes * 10) + (pledge * 0.1),
            sparkline_data: history
        };
    });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new feature
app.post('/api/features', async (req, res) => {
  const { title, description, category, initial_pledge, deadline, ticker } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const pledge = (initial_pledge && !isNaN(initial_pledge)) ? parseFloat(initial_pledge) : 0;

  let finalTicker = ticker;
  if (!finalTicker) {
      // Generate ticker from title (e.g. "Dark Mode" -> "DARK")
      finalTicker = title.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
      if (finalTicker.length < 3) {
          finalTicker = (title.toUpperCase() + "XXX").slice(0, 3);
      }
  }

  const sql = 'INSERT INTO features (title, description, category, pledged_amount, deadline, ticker) VALUES (?, ?, ?, ?, ?, ?)';
  const params = [title, description || '', category || 'feature', pledge, deadline || null, finalTicker];

  try {
    const { lastID } = await dbRun(sql, params);

    // If there was an initial pledge, record it in history
    if (pledge > 0) {
        await dbRun('INSERT INTO pledges (feature_id, amount) VALUES (?, ?)', [lastID, pledge]);
    }

    // Update latest IPO timestamp
    latestIPOTimestamp = Date.now();

    const row = await dbGet('SELECT * FROM features WHERE id = ?', [lastID]);
    res.json({ message: 'Feature created', data: row });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Market Status (Latest IPO)
app.get('/api/market/status', (req, res) => {
    res.json({ latest_ipo_timestamp: latestIPOTimestamp });
});

// Get Platform Stats
app.get('/api/stats', async (req, res) => {
    try {
        const [payoutRow, activeRow, topCategoryRow, burnedRow, darkPoolRow, proRevenueRow] = await Promise.all([
            dbGet("SELECT SUM(pledged_amount) as val FROM features WHERE status = 'live' AND category != 'pro_subscription'"),
            dbGet("SELECT SUM(pledged_amount) as val FROM features WHERE status != 'live' AND category != 'pro_subscription'"),
            dbGet("SELECT category, SUM(pledged_amount) as total FROM features WHERE category != 'pro_subscription' GROUP BY category ORDER BY total DESC LIMIT 1"),
            dbGet("SELECT SUM(pledged_amount) as val FROM features WHERE status != 'live' AND deadline < datetime('now') AND category != 'pro_subscription'"),
            dbGet("SELECT SUM(amount) as val FROM pledges WHERE is_dark_pool = 1"),
            dbGet("SELECT SUM(pledged_amount) as val FROM features WHERE category = 'pro_subscription' AND is_burned = 1")
        ]);

        const stats = {};
        stats.total_payout = payoutRow && payoutRow.val ? payoutRow.val : 0;
        stats.active_bounty = activeRow && activeRow.val ? activeRow.val : 0;
        stats.top_category = topCategoryRow ? topCategoryRow.category : 'N/A';
        stats.burned_amount = burnedRow && burnedRow.val ? burnedRow.val : 0;

        const darkPoolTotal = darkPoolRow && darkPoolRow.val ? darkPoolRow.val : 0;
        const proRevenueTotal = proRevenueRow && proRevenueRow.val ? proRevenueRow.val : 0;

        const totalMoney = (stats.total_payout || 0) + (stats.active_bounty || 0);

        // Base Revenue = 5% of all pledges
        let baseRevenue = totalMoney * 0.05;

        // Dark Pool Revenue = Extra 10% on dark pool pledges (total 15%)
        stats.dark_pool_fees = darkPoolTotal * 0.10;

        // Pro Subscription Revenue
        stats.pro_revenue = proRevenueTotal;

        // Total Revenue = Base (5%) + Dark Pool Extra (10%) + Burned amounts + Pro Subscriptions (100% of it)
        stats.platform_revenue = baseRevenue + stats.dark_pool_fees + stats.burned_amount + stats.pro_revenue;

        // Withdrawals
        const payoutSum = await dbGet('SELECT SUM(amount) as val FROM payouts');
        const totalWithdrawn = payoutSum && payoutSum.val ? payoutSum.val : 0;
        stats.total_withdrawn = totalWithdrawn;
        stats.available_balance = stats.platform_revenue - totalWithdrawn;

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Pro subscription
app.post('/api/market/pro-subscription', async (req, res) => {
    try {
        const sqlFeature = `INSERT INTO features (title, description, category, status, pledged_amount, is_burned) VALUES (?, ?, ?, ?, ?, ?)`;
        const result = await dbRun(sqlFeature, ['CodeStreet PRO', 'Pro Subscription', 'pro_subscription', 'live', 99.0, 1]);
        const newId = result.lastID;

        await dbRun('INSERT INTO pledges (feature_id, amount) VALUES (?, ?)', [newId, 99.0]);
        res.json({ message: 'Pro subscription purchased', feature_id: newId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Market Crash Simulation (The "Surprise")
app.post('/api/market/crash', async (req, res) => {
    const CRASH_PERCENT = 0.20;
    try {
        const features = await dbAll('SELECT id, pledged_amount FROM features WHERE pledged_amount > 0');

        let totalLost = 0;
        const promises = features.map(async (f) => {
            const loss = Math.floor(f.pledged_amount * CRASH_PERCENT);
            if (loss > 0) {
                totalLost += loss;
                // 1. Record negative pledge (Market Correction)
                await dbRun('INSERT INTO pledges (feature_id, amount) VALUES (?, ?)', [f.id, -loss]);
                // 2. Update feature
                await dbRun('UPDATE features SET pledged_amount = pledged_amount - ? WHERE id = ?', [loss, f.id]);
            }
        });

        await Promise.all(promises);

        res.json({
            message: 'MARKET CRASH TRIGGERED',
            total_value_erased: totalLost,
            affected_assets: features.length
        });
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
  const { amount, is_dark_pool } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
      res.status(400).json({ error: 'Valid amount is required' });
      return;
  }

  const sqlFeature = 'UPDATE features SET pledged_amount = pledged_amount + ? WHERE id = ?';
  const sqlPledge = 'INSERT INTO pledges (feature_id, amount, is_dark_pool) VALUES (?, ?, ?)';

  try {
    // 1. Record the pledge transaction
    await dbRun(sqlPledge, [id, amount, is_dark_pool ? 1 : 0]);

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

// Get all payouts
app.get('/api/admin/payouts', async (req, res) => {
    try {
        const rows = await dbAll('SELECT * FROM payouts ORDER BY created_at DESC, id DESC');
        res.json({ data: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Process a payout
app.post('/api/admin/payout', async (req, res) => {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
        res.status(400).json({ error: 'Valid amount is required' });
        return;
    }

    try {
        const { lastID } = await dbRun('INSERT INTO payouts (amount) VALUES (?)', [amount]);
        const row = await dbGet('SELECT * FROM payouts WHERE id = ?', [lastID]);
        res.json({ message: 'Payout processed', data: row });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Distribute Dividends (Admin)
app.post('/api/market/dividends', async (req, res) => {
    const { amount_per_share } = req.body;
    if (!amount_per_share || isNaN(amount_per_share) || amount_per_share <= 0) {
        res.status(400).json({ error: 'Valid amount per share is required' });
        return;
    }

    try {
        // Calculate total distributed (approximate based on total pledged / avg price - simplified for now)
        // For simulation, we just track the per-share amount. The client calculates their own cut.
        const { lastID } = await dbRun('INSERT INTO dividends (amount_per_share) VALUES (?)', [amount_per_share]);
        const row = await dbGet('SELECT * FROM dividends WHERE id = ?', [lastID]);
        res.json({ message: 'Dividends Distributed', data: row });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Latest Dividends
app.get('/api/market/dividends', async (req, res) => {
    try {
        const rows = await dbAll('SELECT * FROM dividends ORDER BY created_at DESC LIMIT 5');
        res.json({ data: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get recent pledges (Global)
app.get('/api/pledges/recent', async (req, res) => {
    const sql = `
        SELECT pledges.id, pledges.amount, pledges.created_at, features.title, features.id as feature_id
        FROM pledges
        JOIN features ON pledges.feature_id = features.id
        ORDER BY pledges.created_at DESC
        LIMIT 10
    `;
    try {
        const rows = await dbAll(sql);
        res.json({ data: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
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

// Market Maker Simulation (Inject Liquidity)
app.post('/api/market/simulate', async (req, res) => {
    try {
        const features = await dbAll('SELECT id, title, pledged_amount, votes FROM features');
        if (features.length === 0) {
            res.status(404).json({ error: 'No features to trade' });
            return;
        }

        // Randomly select a feature
        const feature = features[Math.floor(Math.random() * features.length)];
        const amount = Math.floor(Math.random() * 490) + 10; // $10 - $500
        const voteCount = Math.floor(Math.random() * 50) + 1;

        // Execute Trade
        await dbRun('INSERT INTO pledges (feature_id, amount) VALUES (?, ?)', [feature.id, amount]);
        await dbRun('UPDATE features SET pledged_amount = pledged_amount + ?, votes = votes + ? WHERE id = ?', [amount, voteCount, feature.id]);

        // Fetch updated data
        const updatedFeature = await dbGet('SELECT * FROM features WHERE id = ?', [feature.id]);

        res.json({
            message: 'Market Maker Executed Trade',
            data: {
                feature: updatedFeature.title,
                amount_invested: amount,
                votes_added: voteCount,
                new_total: updatedFeature.pledged_amount
            }
        });
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
