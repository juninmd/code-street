const express = require('express');
const { generateHackerLeak, generateBusinessIdea, generateExecutionBlueprint, generateMVPCode, generateMarketingAssets } = require('./gemini');

const cors = require('cors');
const db = require('./db');
const util = require('util');
const Stripe = require('stripe');

// Initialize Stripe with a test key (in a real app, this would be an environment variable)
// Using a mock implementation since standard test keys may expire or be invalid in this sandbox
const stripe = {
    checkout: {
        sessions: {
            create: async (params) => {
                return { id: `cs_test_mock_${Math.random().toString(36).substring(7)}` };
            }
        }
    }
};

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const path = require('path');
// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, '../dist')));

// SPA catch-all: Serve index.html for any unknown routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});


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


// --- ETF / Market Indexes ---
app.get('/api/etfs', async (req, res) => {
    try {
        const rows = await dbAll('SELECT * FROM features WHERE status != "rejected" AND status != "completed"');

        // Group by category
        const categories = {};
        rows.forEach(row => {
            const cat = row.category || 'other';
            if (!categories[cat]) categories[cat] = [];
            const pledge = row.pledged_amount || 0;
            const short_amount = row.short_amount || 0;
            const current_price = Math.max(0.01, 1.00 + (row.votes * 0.10) + (pledge * 0.001) - (short_amount * 0.001));
            categories[cat].push({ ...row, current_price });
        });

        const etfs = Object.keys(categories).map(cat => {
            const features = categories[cat];
            const avgPrice = features.reduce((sum, f) => sum + f.current_price, 0) / features.length;
            const totalVolume = features.reduce((sum, f) => sum + (f.pledged_amount || 0), 0);
            const totalShorts = features.reduce((sum, f) => sum + (f.short_amount || 0), 0);

            // Ticker generation based on category
            let ticker = cat.toUpperCase().slice(0, 3) + '500';
            if (cat === 'ai') ticker = 'AITX';
            if (cat === 'frontend') ticker = 'UI100';
            if (cat === 'backend') ticker = 'SRVR';
            if (cat === 'mobile') ticker = 'MOBI';

            return {
                id: `etf-${cat}`,
                name: `${cat.charAt(0).toUpperCase() + cat.slice(1)} Innovation Index`,
                ticker: ticker,
                category: cat,
                current_price: parseFloat(avgPrice.toFixed(2)),
                volume: totalVolume,
                short_volume: totalShorts,
                components_count: features.length,
                day_change: parseFloat((((features.length * 13.5) % 10) - 5).toFixed(2)) // deterministic fake change
            };
        });

        res.json({ data: etfs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/etfs/buy', async (req, res) => {
    const { category, amount, is_dark_pool } = req.body;

    if (!category || !amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid ETF purchase request' });
    }

    try {
        const features = await dbAll('SELECT id FROM features WHERE category = ? AND status != "rejected" AND status != "completed"', [category]);
        if (features.length === 0) {
            return res.status(400).json({ error: 'No features found in this category' });
        }

        // Distribute amount equally
        const splitAmount = amount / features.length;

        await dbRun('BEGIN TRANSACTION');

        for (const feature of features) {
            const amountAfterFee = is_dark_pool ? splitAmount * 0.85 : splitAmount * 0.95;
            const feeAmount = is_dark_pool ? splitAmount * 0.15 : splitAmount * 0.05;

            await dbRun('UPDATE features SET pledged_amount = pledged_amount + ? WHERE id = ?', [amountAfterFee, feature.id]);

            await dbRun(
                'INSERT INTO pledges (feature_id, amount, is_dark_pool) VALUES (?, ?, ?)',
                [feature.id, amountAfterFee, is_dark_pool ? 1 : 0]
            );

            // Record platform fee
            await dbRun(
                'INSERT INTO payouts (amount, status) VALUES (?, ?)',
                [feeAmount, 'platform_fee']
            );
        }

        await dbRun('COMMIT');
        res.json({ success: true, message: `Successfully invested ${amount} across ${features.length} ${category} features.` });
    } catch (err) {
        await dbRun('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});


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
        const short_amount = row.short_amount || 0;
        const current_price = Math.max(0.01, 1.00 + (row.votes * 0.10) + (pledge * 0.001) - (short_amount * 0.001));
        // Deterministic 24h change based on ID
        const day_change = ((row.id * 13.5) % 10) - 5;

        return {
            ...row,
            current_price: parseFloat(current_price.toFixed(2)),
            day_change: parseFloat(day_change.toFixed(2)),
            hype_score: (row.votes * 10) + (pledge * 0.1),
            short_amount: short_amount,
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

// Short a feature
app.post('/api/features/:id/short', async (req, res) => {
  const { id } = req.params;
  const { amount, is_dark_pool = false } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
      res.status(400).json({ error: 'Valid amount is required' });
      return;
  }

  const sqlFeature = 'UPDATE features SET short_amount = COALESCE(short_amount, 0) + ? WHERE id = ?';
  const sqlPledge = 'INSERT INTO pledges (feature_id, amount, is_short, is_dark_pool) VALUES (?, ?, 1, ?)';

  try {
    await dbRun('BEGIN TRANSACTION');
    // 1. Update the short amount
    const { changes } = await dbRun(sqlFeature, [amount, id]);

    if (changes === 0) {
        await dbRun('ROLLBACK');
        res.status(404).json({ error: 'Feature not found' });
        return;
    }

    // 2. Record the short transaction
    await dbRun(sqlPledge, [id, amount, is_dark_pool ? 1 : 0]);

    await dbRun('COMMIT');
    res.json({ message: 'Shorted', changes });
  } catch (err) {
    await dbRun('ROLLBACK');
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

        // Options Revenue
        const optionsRevenueRow = await dbGet("SELECT SUM(premium_paid * 0.05) as options_fees FROM options_contracts");
        const optionsFees = optionsRevenueRow && optionsRevenueRow.options_fees ? optionsRevenueRow.options_fees : 0;

        // Total Revenue = Base (5%) + Dark Pool Extra (10%) + Burned amounts + Pro Subscriptions (100% of it) + Options Fees (5%)
        stats.platform_revenue = baseRevenue + stats.dark_pool_fees + stats.burned_amount + stats.pro_revenue + optionsFees;
        stats.options_fees = optionsFees;

        // Withdrawals
        const payoutSum = await dbGet('SELECT SUM(amount) as val FROM payouts');
        const totalWithdrawn = payoutSum && payoutSum.val ? payoutSum.val : 0;
        stats.total_withdrawn = totalWithdrawn;
        stats.available_balance = stats.platform_revenue - totalWithdrawn;

        // MRR Calculation
        const mrrRow = await dbGet("SELECT SUM(CASE WHEN plan = 'pro' THEN 49 WHEN plan = 'enterprise' THEN 199 ELSE 0 END) as mrr FROM workspaces");
        stats.mrr = mrrRow?.mrr || 0;

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Workspaces API ---

// Get all workspaces
app.get('/api/admin/workspaces', async (req, res) => {
    try {
        const rows = await dbAll('SELECT * FROM workspaces ORDER BY created_at DESC');
        res.json({ data: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a workspace
app.post('/api/admin/workspaces', async (req, res) => {
    const { name, plan } = req.body;
    if (!name) return res.status(400).json({ error: 'Workspace name is required' });

    const selectedPlan = ['free', 'pro', 'enterprise'].includes(plan) ? plan : 'free';
    const sql = 'INSERT INTO workspaces (name, plan) VALUES (?, ?)';

    try {
        const { lastID } = await dbRun(sql, [name, selectedPlan]);
        const workspace = await dbGet('SELECT * FROM workspaces WHERE id = ?', [lastID]);
        res.json({ message: 'Workspace created', data: workspace });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update workspace plan
app.put('/api/admin/workspaces/:id/plan', async (req, res) => {
    const { id } = req.params;
    const { plan } = req.body;

    if (!['free', 'pro', 'enterprise'].includes(plan)) {
        return res.status(400).json({ error: 'Invalid plan type' });
    }

    try {
        const { changes } = await dbRun('UPDATE workspaces SET plan = ? WHERE id = ?', [plan, id]);
        if (changes === 0) return res.status(404).json({ error: 'Workspace not found' });

        const workspace = await dbGet('SELECT * FROM workspaces WHERE id = ?', [id]);
        res.json({ message: 'Plan updated', data: workspace });
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

// Get candlestick history for a feature
app.get('/api/features/:id/candlesticks', async (req, res) => {
    const { id } = req.params;
    const { timeframe } = req.query; // 'day' or 'hour' or 'minute'

    // Use hourly by default for simulation
    const timeFormat = timeframe === 'day' ? '%Y-%m-%d' :
                       timeframe === 'minute' ? '%Y-%m-%d %H:%M' :
                       '%Y-%m-%d %H:00';

    try {
        // We need an opening and closing price for real candlesticks
        // Since pledges are additive, we calculate running total first

        const allPledgesSql = 'SELECT amount, strftime(?, created_at) as time_bucket FROM pledges WHERE feature_id = ? ORDER BY created_at ASC';
        const allPledges = await dbAll(allPledgesSql, [timeFormat, id]);

        // Calculate cumulative totals per bucket
        let runningTotal = 0;
        let lastBucket = null;

        const buckets = {};

        allPledges.forEach(p => {
            const bucket = p.time_bucket;
            if (!buckets[bucket]) {
                buckets[bucket] = {
                    open: runningTotal, // The price at start of this bucket is the running total before any new pledges
                    high: runningTotal,
                    low: runningTotal,
                    close: runningTotal,
                    volume: 0,
                    transactions: 0
                };
            }

            // Add to running total
            runningTotal += p.amount;
            buckets[bucket].close = runningTotal;
            buckets[bucket].volume += p.amount;
            buckets[bucket].transactions += 1;

            // If the running total goes higher than the max seen this bucket
            if (runningTotal > buckets[bucket].high) buckets[bucket].high = runningTotal;
            if (runningTotal < buckets[bucket].low) buckets[bucket].low = runningTotal;
        });

        const candlesticks = Object.keys(buckets).sort().map(bucket => ({
            time: bucket,
            ...buckets[bucket]
        }));

        res.json({ data: candlesticks });
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

// --- Options API ---

// Buy an Options Contract
app.post('/api/options/buy', async (req, res) => {
    const { feature_id, type, strike_price, expiration_date, premium_paid } = req.body;

    if (!feature_id || !type || !strike_price || !expiration_date || !premium_paid) {
        return res.status(400).json({ error: 'Missing required options parameters' });
    }

    const sql = `
        INSERT INTO options_contracts (feature_id, type, strike_price, expiration_date, premium_paid, status)
        VALUES (?, ?, ?, ?, ?, 'active')
    `;

    try {
        const { lastID } = await dbRun(sql, [feature_id, type, strike_price, expiration_date, premium_paid]);
        const contract = await dbGet('SELECT * FROM options_contracts WHERE id = ?', [lastID]);
        res.json({ message: 'Options contract purchased', data: contract });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get User's Options Portfolio
app.get('/api/options/portfolio', async (req, res) => {
    try {
        // We calculate current_price_simulation since it's not actually stored in the DB but derived
        const rows = await dbAll(`
            SELECT o.*, f.title as feature_title, f.votes, f.pledged_amount
            FROM options_contracts o
            JOIN features f ON o.feature_id = f.id
            ORDER BY o.created_at DESC
        `);

        const data = rows.map(row => {
            const current_price = 1.00 + (row.votes * 0.10) + ((row.pledged_amount || 0) * 0.001);
            return {
                ...row,
                current_price: parseFloat(current_price.toFixed(2))
            };
        });

        res.json({ data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Exercise an Options Contract
app.post('/api/options/exercise/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Ensure contract exists and is active
        const contract = await dbGet('SELECT * FROM options_contracts WHERE id = ?', [id]);
        if (!contract) return res.status(404).json({ error: 'Contract not found' });
        if (contract.status !== 'active') return res.status(400).json({ error: 'Contract is not active' });

        // Get current price
        const featureRow = await dbGet('SELECT votes, pledged_amount FROM features WHERE id = ?', [contract.feature_id]);
        if (!featureRow) return res.status(404).json({ error: 'Underlying asset not found' });

        const current_price = 1.00 + (featureRow.votes * 0.10) + ((featureRow.pledged_amount || 0) * 0.001);

        // Calculate payout
        let payout = 0;
        if (contract.type === 'call' && current_price > contract.strike_price) {
            payout = (current_price - contract.strike_price) * 100; // Assuming 1 contract = 100 shares for fun math
        } else if (contract.type === 'put' && current_price < contract.strike_price) {
            payout = (contract.strike_price - current_price) * 100;
        }

        if (payout <= 0) {
            return res.status(400).json({ error: 'Contract is out-of-the-money. Cannot exercise.' });
        }

        // 5% Exercise Fee
        const exercise_fee = payout * 0.05;
        const net_payout = payout - exercise_fee;

        // Update contract status
        const { changes } = await dbRun("UPDATE options_contracts SET status = 'exercised' WHERE id = ? AND status = 'active'", [id]);

        if (changes === 0) {
            return res.status(400).json({ error: 'Contract is not active or has already been exercised.' });
        }

        // Note: In a real app we'd add `net_payout` to the user's cash balance.
        // For the simulation, we'll just return it.

        res.json({
            message: 'Contract exercised successfully',
            gross_payout: parseFloat(payout.toFixed(2)),
            fee: parseFloat(exercise_fee.toFixed(2)),
            net_payout: parseFloat(net_payout.toFixed(2))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Hacker Leak Generator
app.post('/api/market/hacker-leak', async (req, res) => {
    const { title, ticker } = req.body;

    try {
        let intel = null;
        if (title) {
            intel = await generateHackerLeak(title, ticker);
        }

        // Fallback to random intel if API fails or is not configured
        if (!intel) {
            const hints = [
                `[DECRYPTED_COMMS]: Whale wallets accumulating ${ticker || 'ASSET'} in dark pools. Upward volatility expected.`,
                `[LEAKED_SLACK]: Dev team struggling with ${ticker || 'ASSET'} implementation. Delivery likely delayed. Short interest rising.`,
                `[INSIDER_DUMP]: Major stakeholder preparing to offload shares. Support levels at risk.`,
                `[REPO_SCRAPE]: Commits surging for ${ticker || 'ASSET'}. Codebase near completion. Impending IPO spike.`,
                `[MARKET_MAKER_LOG]: Algo flagged ${ticker || 'ASSET'} as severely undervalued. Accumulation phase initiated.`,
                `[CEO_EMAIL_INTERCEPT]: "Pivot resources away from ${ticker || 'ASSET'} immediately." Sell signals flashing.`
            ];
            intel = hints[Math.floor(Math.random() * hints.length)];
        }

        res.json({ intel });
    } catch (err) {
        res.status(500).json({ error: err.message });
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

// Quantum Trade Simulation
app.post('/api/market/quantum-trade', async (req, res) => {
    const { investment } = req.body;

    if (!investment || isNaN(investment) || investment <= 0) {
        res.status(400).json({ error: 'Valid investment amount is required' });
        return;
    }

    try {
        const features = await dbAll('SELECT id, title, pledged_amount, votes FROM features');
        if (features.length === 0) {
            res.status(404).json({ error: 'No features available for Quantum Trading' });
            return;
        }

        // 5% Quantum Computation Fee
        const computationFee = investment * 0.05;
        const activeInvestment = investment - computationFee;

        // Record the fee as a generic platform revenue (we'll just use a phantom feature or burned amount for simplicity,
        // but here we can just create a special pledge to a "pro_subscription" category or just insert into pledges)
        // Let's create a special system record or just add it to a burned feature if we had one.
        // For simplicity, we'll insert a dummy pledge with feature_id=0 (if allowed, or just skip it and let it be an abstract fee).
        // To be safe with foreign keys, we'll just acknowledge the fee in the response and let the frontend handle the cash deduction.

        // Simulate 3 to 5 micro-trades
        const numTrades = Math.floor(Math.random() * 3) + 3;
        let totalReturn = 0;
        const trades = [];

        await dbRun('BEGIN TRANSACTION');

        for (let i = 0; i < numTrades; i++) {
            const feature = features[Math.floor(Math.random() * features.length)];
            const tradeType = Math.random() > 0.5 ? 'long' : 'short';
            const tradeAmount = activeInvestment / numTrades;

            // Artificial "Quantum AI" success probability (e.g., 60% chance to win on each micro-trade)
            const isWin = Math.random() > 0.4;
            const multiplier = isWin ? (1.1 + Math.random() * 0.4) : (0.5 + Math.random() * 0.4); // Win 10-50%, Lose 10-50%
            const tradeResult = Math.round((tradeAmount * multiplier) * 100) / 100;

            totalReturn += tradeResult;

            trades.push({
                feature_title: feature.title,
                type: tradeType,
                invested: Math.round(tradeAmount * 100) / 100,
                result: tradeResult,
                profit: Math.round((tradeResult - tradeAmount) * 100) / 100
            });

            // Impact the market slightly
            const marketImpact = tradeAmount * 0.1; // 10% of trade hits the actual market
            if (tradeType === 'long') {
                await dbRun('UPDATE features SET pledged_amount = pledged_amount + ? WHERE id = ?', [marketImpact, feature.id]);
                await dbRun('INSERT INTO pledges (feature_id, amount, is_dark_pool) VALUES (?, ?, ?)', [feature.id, marketImpact, 1]);
            } else {
                await dbRun('UPDATE features SET short_amount = COALESCE(short_amount, 0) + ? WHERE id = ?', [marketImpact, feature.id]);
                await dbRun('INSERT INTO pledges (feature_id, amount, is_short, is_dark_pool) VALUES (?, ?, ?, ?)', [feature.id, marketImpact, 1, 1]);
            }
        }

        await dbRun('COMMIT');

        const netProfit = totalReturn - investment; // Net profit compared to original investment

        res.json({
            message: 'Quantum Execution Complete',
            investment: parseFloat(investment.toFixed(2)),
            fee: parseFloat(computationFee.toFixed(2)),
            total_return: parseFloat(totalReturn.toFixed(2)),
            net_profit: parseFloat(netProfit.toFixed(2)),
            trades: trades
        });

    } catch (err) {
        await dbRun('ROLLBACK');
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

// Foundry Generate Idea Route
app.post('/api/foundry/generate', async (req, res) => {
    try {
        let idea = await generateBusinessIdea();

        if (!idea) {
             // Fallback if AI fails or no key is provided
             const adjectives = ['AI-Powered', 'Decentralized', 'Automated', 'Cloud-Native', 'Real-time'];
             const nouns = ['CRM', 'ERP', 'Analytics', 'Workflow', 'Marketplace'];
             const targets = ['Freelancers', 'Enterprise', 'Creators', 'Agencies', 'Developers'];

             const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
             const noun = nouns[Math.floor(Math.random() * nouns.length)];
             const target = targets[Math.floor(Math.random() * targets.length)];

             idea = {
                 title: `${adjective} ${noun}`,
                 ticker: noun.substring(0, 4).toUpperCase(),
                 description: `A ${adjective.toLowerCase()} ${noun.toLowerCase()} built specifically for ${target.toLowerCase()}.`,
                 initial_price: Math.floor(Math.random() * 40) + 10
             };
        }

        // Insert as an IPO into features
        const query = `INSERT INTO features (title, description, ticker) VALUES (?, ?, ?)`;
        const result = await dbRun(query, [idea.title, idea.description, idea.ticker]);
        const newFeatureId = result.lastID;

        // Update IPO timestamp
        latestIPOTimestamp = Date.now();

        // Simulate initial market demand by inserting initial pledges
        const numPledges = Math.floor(Math.random() * 5) + 3; // 3 to 7 initial pledges
        let totalPledged = 0;

        for (let i = 0; i < numPledges; i++) {
            const amount = parseFloat((Math.random() * 50 + 10).toFixed(2));
            const shares = amount / 10; // Simulated share calculation
            await dbRun(
                 `INSERT INTO pledges (feature_id, amount) VALUES (?, ?)`,
                 [newFeatureId, amount]
            );
            totalPledged += amount;
        }

        await dbRun('UPDATE features SET pledged_amount = ?, votes = ? WHERE id = ?', [totalPledged, numPledges * 5, newFeatureId]);

        // Return the idea and the created ID
        res.json({ idea: { ...idea, id: newFeatureId, pledged_amount: totalPledged } });

    } catch (err) {
        console.error("Foundry Generate Error:", err);
        res.status(500).json({ error: "Failed to generate AI idea" });
    }
});

// Foundry Blueprint Generator Route
app.post('/api/foundry/blueprint', async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
    }

    try {
        let blueprint = await generateExecutionBlueprint(title, description);

        if (!blueprint) {
            blueprint = `
### Execution Blueprint: ${title}

1.  **Target Audience:** Early adopters in the specific niche.
2.  **Core Features (MVP):** Basic authentication, core value proposition workflow, and a simple dashboard.
3.  **Tech Stack:** React (Frontend), Node.js/Express (Backend), SQLite/PostgreSQL (Database).
4.  **Monetization Strategy:** Freemium model with a $15/mo Pro tier.
5.  **First Marketing Step:** Launch on Product Hunt and post in relevant Reddit communities.
            `.trim();
        }

        res.json({ blueprint });
    } catch (err) {
        console.error("Foundry Blueprint Error:", err);
        res.status(500).json({ error: "Failed to generate execution blueprint" });
    }
});

// Foundry MVP Builder Route
app.post('/api/foundry/build-mvp', async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
    }

    try {
        let mvpCode = await generateMVPCode(title, description);

        if (!mvpCode) {
            mvpCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - MVP</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 flex items-center justify-center min-h-screen">
    <div class="max-w-2xl text-center p-8 bg-white rounded-xl shadow-xl">
        <h1 class="text-4xl font-extrabold text-gray-900 mb-4">${title}</h1>
        <p class="text-xl text-gray-600 mb-8">${description}</p>
        <button class="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition">Get Started</button>
    </div>
</body>
</html>`;
        }

        res.json({ code: mvpCode });
    } catch (err) {
        console.error("Foundry MVP Builder Error:", err);
        res.status(500).json({ error: "Failed to generate MVP code" });
    }
});

app.post('/api/foundry/marketing', async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
    }

    try {
        let marketingAssets = await generateMarketingAssets(title, description);

        if (!marketingAssets) {
            marketingAssets = `### Twitter Thread\n\n1/ Introducing ${title} 🚀\n\nAre you struggling with [Problem]? We just built the solution. \n\n${description}\n\n👇 A thread on why we built this.\n\n### Cold Email\n\nSubject: Quick question about [Problem]\n\nHi [Name],\n\nI noticed you are [Relevance]. We just launched ${title} to help with exactly that. \n\n${description}\n\nWorth a 5 min chat?\n\nBest,\nFounder`;
        }

        res.json({ marketingAssets });
    } catch (err) {
        console.error("Foundry Marketing Assets Error:", err);
        res.status(500).json({ error: "Failed to generate marketing assets" });
    }
});

// --- Stripe SaaS Integration ---
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { tier } = req.body;

        if (tier !== 'enterprise') {
            return res.status(400).json({ error: "Invalid tier" });
        }

        // Create a mock Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'CodeStreet Enterprise Workspace',
                        },
                        unit_amount: 49900, // $499.00
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: 'http://localhost:5173/pricing?success=true&session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:5173/pricing?canceled=true',
        });

        res.json({ id: session.id });
    } catch (err) {
        console.error("Stripe Checkout Error:", err);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
});

// We need a raw body parser for the webhook signature verification,
// but for this implementation we will accept parsed JSON to simplify testing.
app.post('/api/webhook', async (req, res) => {
    const event = req.body;

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // Fulfill the purchase...
        const workspaceName = `Enterprise Workspace - ${session.id.substring(0, 8)}`;
        const planType = 'enterprise';

        try {
            await dbRun(
                `INSERT INTO workspaces (name, plan) VALUES (?, ?)`,
                [workspaceName, planType]
            );
            console.log(`✅ Provisioned new Workspace: ${workspaceName}`);
        } catch (dbErr) {
            console.error("Failed to provision workspace:", dbErr);
            return res.status(500).json({ error: "Database error" });
        }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
